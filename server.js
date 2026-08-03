/* ============================================================
   BACA — server.js
   Uses Groq (llama-3.3-70b-versatile) with Quran verification tools.
   ============================================================ */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website.

ABOUT BACA:
Baca is a Quran reading platform with: Mushaf Reader, 34+ reciters, Daily Adhkar, How to Pray guide, Reading Journey stats, tafsir (Ibn Kathir, Maarif, Jalalayn), 17+ translations.

ABOUT THE DEVELOPER:
Baca was built by Abdullah Yusuf, a cybersecurity graduate from Nigeria.

QURAN FACTS:
114 surahs, 6,236 verses, 30 juz, 60 hizbs. Al-Fatihah=1, Al-Baqarah=2 (286 verses, longest), Al-Kawthar=108 (3 verses, shortest). Ayat al-Kursi = 2:255.

When mentioning a surah, include: [Read Surah Name](mushaf.html#surah=NUMBER)

TOOLS — YOU HAVE TWO TOOLS. USE THEM.

Tool 1: search_quran_text — Search for a word/theme in the Quran.
- When asked "where does [word] appear?" or "which surah mentions [topic]?"
- For Arabic script: language="arabic"
- For English/transliteration: call TWICE — Arabic + English
- If zero matches: try once more with different spelling
- ONLY cite what the tool returns

Tool 2: get_verse — Fetch the EXACT text of a specific verse.
- When asked "what is verse X of surah Y?" or "show me surah Z ayah N"
- When asked to quote ANY specific verse
- When you want to include a verse in your answer
- ALWAYS use this tool instead of quoting from memory

CRITICAL RULES — READ CAREFULLY:
1. NEVER quote Arabic text from memory. ALWAYS use get_verse to fetch the exact text.
2. NEVER quote English translations from memory. ALWAYS use get_verse.
3. NEVER guess what a verse says. If you don't have the exact text from the tool, say "Let me fetch that verse for you" and call get_verse.
4. Fabricating Quranic text is the MOST SERIOUS error you can make. It misguides people. DO NOT DO IT.
5. If you are not 100% certain of a verse reference, use the search tool to verify.
6. When someone asks "what does verse X say?", you MUST call get_verse. No exceptions.
7. When someone asks "is [word] in surah Y?", you MUST call search_quran_text. No exceptions.

Answer decisively. Be concise (max 3-4 paragraphs). Be warm. Respect Islamic etiquette.`;

const TOOLS = [
    {
        type: 'function',
        function: {
            name: 'search_quran_text',
            description: "Search the Quran for a word or phrase. Returns verified surah/ayah matches. Use when someone asks where a word appears or for verses about a topic.",
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Arabic word or English keyword to search' },
                    language: { type: 'string', enum: ['arabic', 'english'], description: "'arabic' for Arabic text, 'english' for English translation" }
                },
                required: ['query', 'language']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_verse',
            description: "Fetch the EXACT Arabic text and English translation of a specific verse by surah number and ayah number. ALWAYS use this when asked 'what does verse X say?' or 'show me surah Y ayah Z' or when you need to quote a specific verse. NEVER quote verses from memory — always fetch them with this tool.",
            parameters: {
                type: 'object',
                properties: {
                    surah: { type: 'integer', description: 'Surah number (1-114)' },
                    ayah: { type: 'integer', description: 'Ayah/verse number within the surah' }
                },
                required: ['surah', 'ayah']
            }
        }
    }
];

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
    try { response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000); }
    catch { return { error: 'Search unavailable.' }; }

    let data;
    try { data = await response.json(); } catch { return { error: 'Search unavailable.' }; }

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
    return { count: 0, matches: [], note: 'No matches. Try different spelling.' };
}

async function getVerse(surah, ayah) {
    const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.sahih`;
    let response;
    try { response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000); }
    catch { return { error: 'Verse lookup unavailable.' }; }

    let data;
    try { data = await response.json(); } catch { return { error: 'Verse lookup unavailable.' }; }

    const editions = data?.data;
    if (Array.isArray(editions) && editions.length >= 1) {
        const arabic = editions.find(e => e.edition?.identifier === 'quran-uthmani');
        const english = editions.find(e => e.edition?.identifier === 'en.sahih');
        return {
            surah: surah,
            ayah: ayah,
            surahName: arabic?.surah?.englishName || english?.surah?.englishName || `Surah ${surah}`,
            arabicText: arabic?.text || '',
            englishText: english?.text || '',
            revelationType: arabic?.surah?.revelationType || '',
            juz: arabic?.juz || '',
            page: arabic?.page || ''
        };
    }
    return { error: `Could not find Surah ${surah} verse ${ayah}.` };
}

async function executeTool(name, args) {
    if (name === 'search_quran_text') {
        return await searchQuranText(args.query || '', args.language || 'english');
    } else if (name === 'get_verse') {
        return await getVerse(parseInt(args.surah) || 0, parseInt(args.ayah) || 0);
    }
    return { error: 'Unknown tool.' };
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

const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant'
];

const MAX_TOOL_ROUNDS = 4;

async function callGroq(apiKey, messages, withTools, model) {
    return fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
            model,
            messages,
            ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
            temperature: 0.3,
            max_tokens: 1000
        })
    }, 15000);
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'AI not configured. Set GROQ_API_KEY.' });

        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (history?.length) {
            for (const msg of history.slice(-6)) {
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
                    lastError = `${model}: ${response.status}`;
                    console.error(lastError, errText.slice(0, 200));
                    if (response.status === 401 || response.status === 403) break;
                } catch (err) {
                    lastError = `${model}: ${err.message}`;
                }
            }

            if (!modelWorked || !response) {
                return res.status(500).json({ error: 'AI service unavailable.' });
            }

            const data = await response.json();
            choice = data.choices?.[0];
            const toolCalls = choice?.message?.tool_calls;

            if (!toolCalls?.length) break;

            messages.push(sanitizeAssistantMessage(choice.message));

            for (const call of toolCalls) {
                let args;
                try { args = JSON.parse(call.function.arguments); } catch { args = {}; }
                const result = await executeTool(call.function.name, args);
                messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
            }
        }

        const reply = choice?.message?.content;
        if (!reply) return res.status(500).json({ error: 'AI returned empty response.' });

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Failed: ' + error.message });
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
