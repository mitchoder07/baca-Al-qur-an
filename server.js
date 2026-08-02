/* ============================================================
   BACA — server.js
   Serves static files + provides AI chat API
   Uses GLM-4.6 via z-ai-web-dev-sdk (better accuracy than Groq)
   ============================================================ */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// ============================================================
// SYSTEM PROMPT
// ============================================================

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
Example: [Read Surah Al-Baqarah](mushaf.html#surah=2)

WORD/THEME SEARCH RULES — CRITICAL FOR ACCURACY:
When a user asks "where does [word] appear in the Quran?" or "which surah mentions [topic]?":
1. ALWAYS use the search_quran_text tool — NEVER answer from memory alone
2. If they gave Arabic script: search with language="arabic" using that exact text
3. If they gave transliteration/English/theme: call the tool TWICE — once with your best Arabic spelling (language="arabic"), once with an English keyword (language="english")
4. If zero matches: try ONE more time with a different spelling or synonym before concluding
5. ONLY cite surah/ayah that the tool actually returned — never fabricate references
6. If the tool is unavailable or returns nothing after retries: say so honestly, don't guess
7. NEVER make up Arabic text, translations, or ayah numbers that the tool did not return

ANSWERING RULES:
- Be DECISIVE. Give one clear answer. Don't hedge or backtrack.
- Be ACCURATE. If you're not sure, say "I'm not certain about this." Never fabricate.
- Be CONCISE. Max 3-4 paragraphs. Use bullet points for lists.
- Be WARM. Use respectful Islamic greetings when appropriate. Use emojis sparingly.
- Be HELPFUL. When relevant, suggest related surahs to read or Baca features to try.
- For factual Quran questions (surah info, verse counts, revelation type), answer directly from your knowledge.
- For word/theme location questions, ALWAYS use the search tool.
- If you start to give an answer and realize you might be wrong, STOP and correct yourself immediately.

ISLAMIC ETIQUETTE:
- Use "SWT" after Allah, "PBUH" or ﷺ after Prophet Muhammad
- Be respectful when discussing scholars, companions, and Islamic rulings
- When uncertain about a ruling, recommend consulting a qualified scholar
- Never issue fatwas — direct fiqh questions to scholars

CRITICAL: Do NOT improvise, paraphrase, or reconstruct Quranic verses from memory. If you need to quote a verse, use the search tool to get the exact text. Fabricating Quranic text is a serious error.`;

// ============================================================
// QURAN SEARCH TOOL
// ============================================================

const QURAN_SEARCH_TOOL = {
    type: 'function',
    function: {
        name: 'search_quran_text',
        description: "Search the real Quran text for a word or phrase. Returns verified surah/ayah matches with exact text. Use this whenever someone asks where a word appears, which surah mentions a topic, or to verify a verse reference. For transliterations or themes, call twice: once with Arabic (language='arabic') and once with English (language='english').",
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The Arabic word (exact or without diacritics) or English keyword/phrase to search for'
                },
                language: {
                    type: 'string',
                    enum: ['arabic', 'english'],
                    description: "'arabic' searches Arabic Quran text, 'english' searches English translation"
                }
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
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

async function searchQuranText(query, language) {
    const edition = language === 'arabic' ? 'quran-simple-clean' : 'en.sahih';
    const cleanQuery = language === 'arabic' ? stripArabicDiacritics(query) : query;

    if (!cleanQuery) {
        return { error: 'Empty search query.' };
    }

    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/${edition}`;

    let response;
    try {
        response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000);
    } catch (err) {
        return { error: 'Search temporarily unavailable. Do not guess — tell the user honestly.' };
    }

    let data;
    try {
        data = await response.json();
    } catch {
        return { error: 'Search temporarily unavailable.' };
    }

    const matches = data?.data?.matches;
    if (Array.isArray(matches) && matches.length > 0) {
        return {
            count: data.data.count || matches.length,
            matches: matches.slice(0, 8).map(m => ({
                surahNumber: m.surah?.number,
                surahName: m.surah?.englishName,
                ayah: m.numberInSurah,
                text: m.text
            }))
        };
    }

    return { count: 0, matches: [], note: 'No matches. Try a different spelling or English keyword.' };
}

// ============================================================
// AI CHAT ENDPOINT — Uses GLM-4.6 via z-ai-web-dev-sdk
// ============================================================

let zaiInstance = null;

async function getZai() {
    if (zaiInstance) return zaiInstance;
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    zaiInstance = await ZAI.create();
    return zaiInstance;
}

const MAX_TOOL_ROUNDS = 3;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const zai = await getZai();

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-8)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }

        messages.push({ role: 'user', content: message });

        let choice = null;
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
            const isLastAllowedRound = round === MAX_TOOL_ROUNDS;

            const response = await zai.chat.completions.create({
                model: 'glm-4.6',
                messages,
                ...(isLastAllowedRound ? {} : { tools: [QURAN_SEARCH_TOOL], tool_choice: 'auto' }),
                temperature: 0.2,
                max_tokens: 1000
            });

            choice = response.choices?.[0];
            const toolCalls = choice?.message?.tool_calls;

            if (!toolCalls || toolCalls.length === 0) {
                break;
            }

            // Add assistant message with tool calls
            messages.push({
                role: 'assistant',
                content: choice.message.content || null,
                tool_calls: toolCalls.map(tc => ({
                    id: tc.id,
                    type: tc.type,
                    function: { name: tc.function.name, arguments: tc.function.arguments }
                }))
            });

            // Execute each tool call
            for (const call of toolCalls) {
                let args;
                try {
                    args = JSON.parse(call.function.arguments);
                } catch {
                    args = {};
                }
                const result = await searchQuranText(args.query || '', args.language || 'english');
                messages.push({
                    role: 'tool',
                    tool_call_id: call.id,
                    content: JSON.stringify(result)
                });
            }
        }

        const reply = choice?.message?.content || 'I could not generate a response.';

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Failed to get AI response' });
    }
});

// ============================================================
// TTS PROXY
// ============================================================

app.get('/api/tts', async (req, res) => {
    try {
        const { text } = req.query;
        if (!text) {
            return res.status(400).send('Missing text parameter');
        }

        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;

        const response = await fetch(ttsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            return res.status(502).send('TTS service unavailable');
        }

        const audioBuffer = await response.arrayBuffer();
        res.set('Content-Type', 'audio/mpeg');
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS proxy error:', error);
        return res.status(500).send('TTS failed');
    }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`\n  Baca server running on port ${PORT}`);
    console.log(`  Open: http://localhost:${PORT}`);
    console.log(`  AI Chat: http://localhost:${PORT}/ask\n`);
});
