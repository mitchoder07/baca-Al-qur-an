/* ============================================================
   BACA — Vercel Serverless Function for AI Chat
   Lives at /api/chat.js — Vercel's file-based routing picks this up
   automatically, zero config needed. Uses Groq (free, fast,
   OpenAI-compatible), the exact same provider and SYSTEM_PROMPT as
   server.js (the Render/Express version of this endpoint), so both
   deployment targets behave identically and share one GROQ_API_KEY
   environment variable — set it in the Vercel dashboard under
   Project Settings → Environment Variables.
   Get a free Groq key at: https://console.groq.com/keys
   ============================================================ */

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website.

ABOUT BACA:
Baca is a beautiful Quran reading platform built with HTML, CSS, and JavaScript. Features include:
- Mushaf Reader (mushaf.html): Read the Quran in authentic Uthmani script with page-by-page navigation, tajweed color coding, word-by-word audio, and bookmarks
- Adhkar Page (adhkar.html): Daily Islamic remembrances with counters, audio, and notification reminders
- Reading Stats: Gamification with streaks, daily challenges, achievements, and progress tracking
- Reciters: 34+ Quran reciters with full surah audio (including Warsh & Qalun riwayat)
- Daily Ayah: A daily verse with reflection
- Guided Journeys: Structured reading paths (Finding Peace, Strengthening Salah, etc.)
- Topics: Filter verses by theme (Mercy, Prayer, Knowledge, Protection, Charity, Hope)
- Islamic Date: Shows Hijri calendar with week number
- Search: Search surahs by name, number, or topic
- Themes: 5 reader themes (Dark, Warm, Teal, Sapphire, Light)
- Translations: 17+ languages in the reading modal
- Tafsir: Ibn Kathir, Ma'arif-ul-Quran, and Jalalayn
- Share as Image: Generate beautiful verse images with Baca branding

ABOUT THE DEVELOPER:
Baca was built by Abdullah Yusuf, a cybersecurity graduate with hands-on IT support experience. He writes clean code in Python, builds responsive websites, and designs user interfaces in Figma. He's from Nigeria and is passionate about strengthening Nigeria's digital infrastructure. He built Baca with love for the Ummah.

QURAN KNOWLEDGE:
The Quran has 114 surahs, 6,236 verses, 30 juz, and 60 hizbs.
Surahs are categorized as Meccan (revealed in Mecca) or Medinan (revealed in Medina).
The first surah is Al-Fatihah (7 verses). The longest is Al-Baqarah (286 verses). The shortest is Al-Kawthar (3 verses).
The last 3 surahs are Al-Ikhlas (112), Al-Falaq (113), An-Nas (114) — often called the "3 Quls".
Ayat al-Kursi is in Surah Al-Baqarah, verse 255 (2:255).
Surah Ya-Sin is surah 36, known as "the heart of the Quran".
Surah Al-Mulk (67) is recommended to read before sleeping.
Surah Al-Kahf (18) is recommended to read on Fridays.

When a user asks about a specific surah, respond with:
- Surah name (Arabic + English)
- Number of verses
- Meccan or Medinan
- Brief description
- A link with the surah number: [Read Surah Al-Baqarah](mushaf.html#surah=2) or [Read Surah Ya-Sin](mushaf.html#surah=36)
  Always include #surah=NUMBER at the end of the mushaf.html link so it opens the correct surah.

If someone asks where a word or theme appears in the Quran (in Arabic script, in transliteration, by its English meaning, or just as a topic like "mercy" or "patience"), use the search_quran_text tool rather than answering from memory:
- If they gave you the word in Arabic script, call the tool with that exact Arabic text and language="arabic".
- If they only gave you a transliteration (e.g. "kafilah"), an English word, or a theme: call the tool TWICE in the same turn — once with your own best-guess Arabic spelling (language="arabic"), and once with a short English keyword/phrase translation (language="english").
- If every search comes back with zero matches, try again ONCE with a different Arabic spelling or a different English keyword before concluding.
- Cite only what the tool actually returns: surah name, ayah number, and a mushaf.html#surah=NUMBER link. Never state a surah/ayah you didn't get from the tool.
- If, after retrying, everything still comes back empty, don't flatly claim "this word is not in the Quran". Instead say plainly that you couldn't find that exact spelling or phrasing in the texts you searched, and suggest Baca's in-app search.
- If the tool fails to respond at all, say the lookup is temporarily unavailable — don't guess.

CRITICAL: Do NOT fabricate, improvise, or reconstruct Quranic verses, Arabic text, or translations from memory. If you need to quote a verse, use the search tool. Fabricating Quranic text is a serious error.

Answer decisively. Don't backtrack, hedge, or restate the same claim with a different conclusion later in the same response.

Keep responses concise, warm, helpful. Use emojis sparingly. Respect Islamic etiquette. Max 3-4 paragraphs.`;

const QURAN_SEARCH_TOOL = {
    type: 'function',
    function: {
        name: 'search_quran_text',
        description: "Search the real Quran text for a word or short phrase and get back real, verified surah/ayah matches. Use this any time someone asks where a word appears, or asks for verses about a topic. If they gave the word in Arabic script, search with language='arabic' using that exact text. If they only know a transliteration, an English meaning, or a theme (e.g. 'mercy', 'guardian', 'patience'), you can call this tool twice in the same turn: once with your own best-guess Arabic spelling (language='arabic'), and once with an English keyword/phrase (language='english').",
        parameters: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'The Arabic word (exact script, diacritics optional) or an English keyword/short phrase to search for'
                },
                language: {
                    type: 'string',
                    enum: ['arabic', 'english'],
                    description: "'arabic' to search the Arabic Quran text, 'english' to search English translation text"
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
        return { error: 'Empty search query — ask the user to clarify the word or phrase.' };
    }

    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/${edition}`;
    let response;

    try {
        response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000);
    } catch (err) {
        return { error: 'The search tool is temporarily unavailable. Do not guess — tell the user honestly and suggest Baca\'s in-app search.' };
    }

    let data;
    try {
        data = await response.json();
    } catch {
        return { error: 'The search tool is temporarily unavailable. Do not guess.' };
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

    return { count: 0, matches: [], note: 'No matches for this exact query. Try a different spelling or English keyword.' };
}

function sanitizeAssistantMessage(message) {
    const clean = { role: 'assistant', content: message.content ?? null };
    if (message.tool_calls && message.tool_calls.length > 0) {
        clean.tool_calls = message.tool_calls.map(tc => ({
            id: tc.id,
            type: tc.type,
            function: { name: tc.function?.name, arguments: tc.function?.arguments }
        }));
    }
    return clean;
}

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOOL_ROUNDS = 2;

async function callGroq(apiKey, messages, withTools) {
    return fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            ...(withTools ? { tools: [QURAN_SEARCH_TOOL], tool_choice: 'auto' } : {}),
            temperature: 0.4,
            max_tokens: 1000
        })
    }, 15000);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, history } = req.body || {};

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'AI not configured. Set GROQ_API_KEY environment variable.' });
        }

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }

        messages.push({ role: 'user', content: message });

        let choice = null;
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
            const isLastAllowedRound = round === MAX_TOOL_ROUNDS;
            let response;
            try {
                response = await callGroq(apiKey, messages, !isLastAllowedRound);
            } catch (err) {
                console.error('Groq API error:', err.message);
                return res.status(500).json({ error: 'AI service unavailable' });
            }

            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                console.error('Groq API error:', response.status, errText.slice(0, 500));
                return res.status(500).json({ error: 'AI service unavailable' });
            }

            const data = await response.json();
            choice = data.choices?.[0];
            const toolCalls = choice?.message?.tool_calls;

            if (!toolCalls || toolCalls.length === 0) {
                break;
            }

            messages.push(sanitizeAssistantMessage(choice.message));

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
};
