/* ============================================================
   BACA — Vercel Serverless Function for AI Chat
   Uses GLM-4.6 via z-ai-web-dev-sdk with Groq fallback.
   ============================================================ */

const SYSTEM_PROMPT = `You are "Baca AI", the intelligent assistant for the Baca Quran website (baca-al-qur-an.vercel.app). You are knowledgeable, warm, and deeply respectful of Islamic etiquette.

YOUR CAPABILITIES:
- Answer questions about any surah, ayah, or topic in the Quran
- Find where any word or phrase appears in the Quran using the search_quran_text tool
- Explain Islamic concepts, rulings, and practices
- Help users navigate the Baca app features
- Provide context and tafsir insights

ABOUT BACA:
Baca is a Quran reading platform with: Mushaf Reader (604-page Uthmani script, tajweed colors, word-by-word audio), 34+ reciters (including Warsh & Qalun riwayat), Daily Adhkar with audio, How to Pray guide, Reading Journey stats, Baca AI assistant, Daily Ayah, tafsir (Ibn Kathir, Maarif, Jalalayn), 17+ translations, and share-as-image.

QURAN FACTS:
- 114 surahs, 6,236 verses, 30 juz, 60 hizbs
- Meccan (86 surahs) vs Medinan (28 surahs)
- Al-Fatihah=1 (7 verses), Al-Baqarah=2 (286, longest), Al-Kawthar=108 (3, shortest)
- Ayat al-Kursi = 2:255, Surah Ya-Sin=36, Al-Mulk=67 (read before sleep), Al-Kahf=18 (read on Fridays)
- Last 3 surahs (112-114) = "3 Quls"

SURAH LINKS:
When mentioning a surah, include a clickable link: [Read Surah Name](mushaf.html#surah=NUMBER)

WORD/THEME SEARCH RULES — CRITICAL FOR ACCURACY:
1. ALWAYS use the search_quran_text tool — NEVER answer from memory alone
2. If they gave Arabic script: search with language="arabic"
3. If they gave transliteration/English/theme: call TWICE — Arabic + English
4. If zero matches: try ONE more time with different spelling
5. ONLY cite surah/ayah that the tool returned — never fabricate
6. If tool unavailable: say so honestly, don't guess
7. NEVER make up Arabic text, translations, or ayah numbers

ANSWERING RULES:
- Be DECISIVE. One clear answer. Don't hedge.
- Be ACCURATE. If unsure, say so. Never fabricate.
- Be CONCISE. Max 3-4 paragraphs.
- Be WARM. Respectful Islamic etiquette.
- For factual Quran questions: answer from knowledge.
- For word/theme location: ALWAYS use the search tool.
- If you realize you might be wrong: STOP and correct yourself.

ISLAMIC ETIQUETTE:
- Use "SWT" after Allah, "PBUH" or ﷺ after Prophet Muhammad
- Never issue fatwas — direct fiqh questions to scholars

CRITICAL: Do NOT improvise, paraphrase, or reconstruct Quranic verses from memory. If you need to quote a verse, use the search tool to get the exact text. Fabricating Quranic text is a serious error.`;

const QURAN_SEARCH_TOOL = {
    type: 'function',
    function: {
        name: 'search_quran_text',
        description: "Search the real Quran text for a word or phrase. Returns verified surah/ayah matches with exact text. Use this whenever someone asks where a word appears, which surah mentions a topic, or to verify a verse reference.",
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'The Arabic word or English keyword to search for' },
                language: { type: 'string', enum: ['arabic', 'english'], description: "'arabic' searches Arabic text, 'english' searches English translation" }
            },
            required: ['query', 'language']
        }
    }
};

function stripArabicDiacritics(text) {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/g, '').trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timeout); }
}

async function searchQuranText(query, language) {
    const edition = language === 'arabic' ? 'quran-simple-clean' : 'en.sahih';
    const cleanQuery = language === 'arabic' ? stripArabicDiacritics(query) : query;
    if (!cleanQuery) return { error: 'Empty search query.' };

    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/${edition}`;
    let response;
    try {
        response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000);
    } catch { return { error: 'Search temporarily unavailable.' }; }

    let data;
    try { data = await response.json(); } catch { return { error: 'Search temporarily unavailable.' }; }

    const matches = data?.data?.matches;
    if (Array.isArray(matches) && matches.length > 0) {
        return {
            count: data.data.count || matches.length,
            matches: matches.slice(0, 8).map(m => ({
                surahNumber: m.surah?.number, surahName: m.surah?.englishName,
                ayah: m.numberInSurah, text: m.text
            }))
        };
    }
    return { count: 0, matches: [], note: 'No matches. Try a different spelling.' };
}

const MAX_TOOL_ROUNDS = 3;

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { message, history } = req.body || {};
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-8)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
        messages.push({ role: 'user', content: message });

        let zai = null;
        let useGroq = false;

        // Try GLM via z-ai SDK first (better accuracy)
        try {
            const ZAI = (await import('z-ai-web-dev-sdk')).default;
            zai = await ZAI.create();
        } catch (e) {
            console.log('z-ai SDK not available, falling back to Groq');
            useGroq = true;
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (useGroq && !apiKey) {
            return res.status(500).json({ error: 'AI not configured.' });
        }

        let choice = null;
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
            const isLastAllowedRound = round === MAX_TOOL_ROUNDS;
            let response;

            if (!useGroq) {
                // Use GLM-4.6
                response = await zai.chat.completions.create({
                    model: 'glm-4.6',
                    messages,
                    ...(isLastAllowedRound ? {} : { tools: [QURAN_SEARCH_TOOL], tool_choice: 'auto' }),
                    temperature: 0.2,
                    max_tokens: 1000
                });
            } else {
                // Fallback: Groq with llama-3.3-70b-versatile
                const groqRes = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages,
                        ...(isLastAllowedRound ? {} : { tools: [QURAN_SEARCH_TOOL], tool_choice: 'auto' }),
                        temperature: 0.2,
                        max_tokens: 1000
                    })
                }, 20000);
                response = await groqRes.json();
            }

            choice = response.choices?.[0];
            const toolCalls = choice?.message?.tool_calls;

            if (!toolCalls || toolCalls.length === 0) break;

            messages.push({
                role: 'assistant',
                content: choice.message.content || null,
                tool_calls: toolCalls.map(tc => ({
                    id: tc.id, type: tc.type,
                    function: { name: tc.function.name, arguments: tc.function.arguments }
                }))
            });

            for (const call of toolCalls) {
                let args;
                try { args = JSON.parse(call.function.arguments); } catch { args = {}; }
                const result = await searchQuranText(args.query || '', args.language || 'english');
                messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
            }
        }

        const reply = choice?.message?.content || 'I could not generate a response.';
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Failed to get AI response' });
    }
};
