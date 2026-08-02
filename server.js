/* ============================================================
   BACA — server.js
   Serves static files + provides AI chat API
   Uses Groq with automatic model fallback
   ============================================================ */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website.

ABOUT BACA:
Baca is a beautiful Quran reading platform with: Mushaf Reader (604-page Uthmani script, tajweed colors, word-by-word audio), 34+ reciters (including Warsh & Qalun riwayat), Daily Adhkar with audio, How to Pray guide, Reading Journey stats, Baca AI assistant, Daily Ayah, tafsir (Ibn Kathir, Maarif, Jalalayn), 17+ translations, and share-as-image.

ABOUT THE DEVELOPER:
Baca was built by Abdullah Yusuf, a cybersecurity graduate from Nigeria. He built Baca with love for the Ummah.

QURAN FACTS:
The Quran has 114 surahs, 6,236 verses, 30 juz, and 60 hizbs.
Al-Fatihah=1 (7 verses), Al-Baqarah=2 (286, longest), Al-Kawthar=108 (3, shortest).
Ayat al-Kursi = 2:255, Surah Ya-Sin=36, Al-Mulk=67 (read before sleep), Al-Kahf=18 (read on Fridays).

When mentioning a surah, include: [Read Surah Name](mushaf.html#surah=NUMBER)

WORD/THEME SEARCH RULES:
When asked "where does [word] appear in the Quran?":
1. ALWAYS use the search_quran_text tool — NEVER answer from memory
2. For Arabic script: search with language="arabic"
3. For transliteration/English: call TWICE — Arabic + English
4. If zero matches: try once more with different spelling
5. ONLY cite results the tool returned — never fabricate
6. If tool fails: say so honestly, don't guess

CRITICAL: Do NOT fabricate or reconstruct Quranic verses from memory. Use the search tool for exact text.

Answer decisively. Be concise (max 3-4 paragraphs). Be warm. Respect Islamic etiquette.`;

const QURAN_SEARCH_TOOL = {
    type: 'function',
    function: {
        name: 'search_quran_text',
        description: "Search the real Quran text for a word or phrase. Returns verified surah/ayah matches. Use whenever someone asks where a word appears or for verses about a topic.",
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Arabic word or English keyword to search' },
                language: { type: 'string', enum: ['arabic', 'english'], description: "'arabic' for Arabic text, 'english' for English translation" }
            },
            required: ['query', 'language']
        }
    }
};

function stripArabicDiacritics(text) {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/g, '').trim();
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
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
    } catch { return { error: 'Search unavailable.' }; }

    let data;
    try { data = await response.json(); } catch { return { error: 'Search unavailable.' }; }

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
    return { count: 0, matches: [], note: 'No matches. Try different spelling.' };
}

function sanitizeAssistantMessage(message) {
    const clean = { role: 'assistant', content: message.content ?? null };
    if (message.tool_calls?.length > 0) {
        clean.tool_calls = message.tool_calls.map(tc => ({
            id: tc.id, type: tc.type,
            function: { name: tc.function?.name, arguments: tc.function?.arguments }
        }));
    }
    return clean;
}

// Model fallback chain
const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant'
];

const MAX_TOOL_ROUNDS = 2;

async function callGroq(apiKey, messages, withTools, model) {
    return fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model,
            messages,
            ...(withTools ? { tools: [QURAN_SEARCH_TOOL], tool_choice: 'auto' } : {}),
            temperature: 0.4,
            max_tokens: 1000
        })
    }, 15000);
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured. Set GROQ_API_KEY env variable.' });

        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (history?.length) {
            for (const msg of history.slice(-10)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
        messages.push({ role: 'user', content: message });

        let choice = null;
        let lastError = '';

        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
            const isLastRound = round === MAX_TOOL_ROUNDS;
            let response = null;
            let modelWorked = false;

            for (const model of MODELS) {
                try {
                    response = await callGroq(apiKey, messages, !isLastRound, model);
                    if (response.ok) { modelWorked = true; break; }
                    const errText = await response.text().catch(() => '');
                    lastError = `Model ${model}: ${response.status} ${errText.slice(0, 200)}`;
                    console.error(lastError);
                    if (response.status === 401 || response.status === 403) break;
                } catch (err) {
                    lastError = `Model ${model}: ${err.message}`;
                    console.error(lastError);
                }
            }

            if (!modelWorked || !response) {
                return res.status(500).json({ error: 'All AI models unavailable. Please try again later.' });
            }

            const data = await response.json();
            choice = data.choices?.[0];
            const toolCalls = choice?.message?.tool_calls;

            if (!toolCalls?.length) break;

            messages.push(sanitizeAssistantMessage(choice.message));

            for (const call of toolCalls) {
                let args;
                try { args = JSON.parse(call.function.arguments); } catch { args = {}; }
                const result = await searchQuranText(args.query || '', args.language || 'english');
                messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
            }
        }

        const reply = choice?.message?.content;
        if (!reply) return res.status(500).json({ error: 'AI returned empty response.' });

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Failed to get AI response: ' + error.message });
    }
});

app.get('/api/tts', async (req, res) => {
    try {
        const { text } = req.query;
        if (!text) return res.status(400).send('Missing text parameter');

        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
        const response = await fetch(ttsUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        if (!response.ok) return res.status(502).send('TTS unavailable');

        const audioBuffer = await response.arrayBuffer();
        res.set('Content-Type', 'audio/mpeg');
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS proxy error:', error);
        return res.status(500).send('TTS failed');
    }
});

app.listen(PORT, () => {
    console.log(`\n  Baca server running on port ${PORT}`);
    console.log(`  Open: http://localhost:${PORT}\n`);
});
