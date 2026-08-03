/* ============================================================
   BACA — server.js
   Uses Google Gemini 2.0 Flash (FREE) with Groq fallback.
   Server pre-searches Quran API automatically.
   ============================================================ */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website (baca-al-qur-an.vercel.app).

You are knowledgeable, warm, and deeply respectful of Islamic etiquette.

ABOUT BACA:
Baca is a Quran reading platform with: Mushaf Reader (604-page Uthmani script, tajweed colors, word-by-word audio), 34+ reciters (including Warsh & Qalun riwayat), Daily Adhkar with audio, How to Pray guide, Reading Journey stats, tafsir (Ibn Kathir, Maarif, Jalalayn), 17+ translations, and share-as-image.

ABOUT THE DEVELOPER:
Baca was built by Abdullah Yusuf, a cybersecurity graduate from Nigeria. He built Baca with love for the Ummah.

QURAN FACTS:
114 surahs, 6,236 verses, 30 juz, 60 hizbs. Al-Fatihah=1, Al-Baqarah=2 (286, longest), Al-Kawthar=108 (3, shortest). Ayat al-Kursi = 2:255.

When mentioning a surah, include: [Read Surah Name](mushaf.html#surah=NUMBER)

HOW TO USE THE SEARCH RESULTS:
If the user's message includes "QURAN SEARCH RESULTS" or "VERSE LOOKUP RESULT", that data was fetched from the real Quran API. Use ONLY that data for your answer. Do NOT add verses from memory. Do NOT contradict the search results.

If no search results were provided, answer from your general knowledge but NEVER fabricate verse text, ayah numbers, or Arabic quotations.

CRITICAL RULES:
1. NEVER fabricate Arabic text or translations
2. If search results are provided, use ONLY those
3. If no results and you're unsure, say "I'm not certain — please use the search in the app"
4. Be helpful, warm, and concise (max 3-4 paragraphs)
5. Use SWT after Allah, PBUH after Prophet Muhammad
6. Never issue fatwas — direct fiqh questions to qualified scholars`;

// ============================================================
// QURAN API — same auto-search logic as api/chat.js
// ============================================================

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timeout); }
}

function stripArabicDiacritics(text) {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/g, '').trim();
}

const SURAH_NAMES = { 'fatihah':1,'al-fatihah':1,'baqarah':2,'al-baqarah':2,'imran':3,'ali imran':3,'nisa':4,'an-nisa':4,'maidah':5,'al-maidah':5,'anam':6,'al-anam':6,'araf':7,'al-araf':7,'anfal':8,'al-anfal':8,'tawbah':9,'at-tawbah':9,'yunus':10,'hud':11,'yusuf':12,'rad':13,'ar-rad':13,'ibrahim':14,'hijr':15,'al-hijr':15,'nahl':16,'an-nahl':16,'isra':17,'al-isra':17,'kahf':18,'al-kahf':18,'maryam':19,'ta-ha':20,'taha':20,'anbiya':21,'al-anbiya':21,'hajj':22,'al-hajj':22,'muminun':23,'al-muminun':23,'nur':24,'an-nur':24,'furqan':25,'al-furqan':25,'shuara':26,'ash-shuara':26,'naml':27,'an-naml':27,'qasas':28,'al-qasas':28,'ankabut':29,'al-ankabut':29,'rum':30,'ar-rum':30,'luqman':31,'sajdah':32,'as-sajdah':32,'ahzab':33,'al-ahzab':33,'saba':34,'fatir':35,'ya-sin':36,'yasin':36,'ya sin':36,'saffat':37,'as-saffat':37,'sad':38,'zumar':39,'az-zumar':39,'ghafir':40,'fussilat':41,'shura':42,'ash-shura':42,'zukhruf':43,'az-zukhruf':43,'dukhan':44,'ad-dukhan':44,'jathiyah':45,'al-jathiyah':45,'ahqaf':46,'al-ahqaf':46,'muhammad':47,'fath':48,'al-fath':48,'hujurat':49,'al-hujurat':49,'qaf':50,'dhariyat':51,'tur':52,'at-tur':52,'najm':53,'an-najm':53,'qamar':54,'al-qamar':54,'rahman':55,'ar-rahman':55,'waqiah':56,'al-waqiah':56,'hadid':57,'al-hadid':57,'mujadila':58,'hashr':59,'al-hashr':59,'mumtahanah':60,'saff':61,'as-saff':61,'jumuah':62,'al-jumuah':62,'munafiqun':63,'taghabun':64,'talaq':65,'at-talaq':65,'tahrim':66,'at-tahrim':66,'mulk':67,'al-mulk':67,'qalam':68,'al-qalam':68,'haqqah':69,'al-haqqah':69,'maarij':70,'al-maarij':70,'nuh':71,'jinn':72,'al-jinn':72,'muzzammil':73,'al-muzzammil':73,'muddaththir':74,'al-muddaththir':74,'qiyamah':75,'insan':76,'al-insan':76,'mursalat':77,'naba':78,'an-naba':78,'naziat':79,'abasa':80,'takwir':81,'at-takwir':81,'infitar':82,'mutaffifin':83,'inshiqaq':84,'buruj':85,'tariq':86,'at-tariq':86,'ala':87,'al-ala':87,'ghashiyah':88,'fajr':89,'al-fajr':89,'balad':90,'al-balad':90,'shams':91,'layl':92,'al-layl':92,'duha':93,'ad-duha':93,'sharh':94,'ash-sharh':94,'tin':95,'at-tin':95,'alaq':96,'al-alaq':96,'qadr':97,'al-qadr':97,'bayyinah':98,'zalzalah':99,'adiyat':100,'qariah':101,'takathur':102,'asr':103,'al-asr':103,'humazah':104,'fil':105,'al-fil':105,'quraysh':106,'maun':107,'al-maun':107,'kawthar':108,'al-kawthar':108,'kafirun':109,'nasr':110,'an-nasr':110,'masad':111,'ikhlas':112,'al-ikhlas':112,'falaq':113,'al-falaq':113,'nas':114,'an-nas':114 };

function wordToArabic(word) {
    const map = { 'abdullah':'عبد الله','abd allah':'عبد الله','rahman':'الرحمن','raheem':'الرحيم','mercy':'رحمة','merciful':'الرحمن','patience':'صبر','sabr':'صبر','jinn':'الجن','satan':'الشيطان','shaytan':'الشيطان','paradise':'الجنة','heaven':'السماء','hell':'النار','fire':'النار','knowledge':'العلم','prayer':'الصلاة','salah':'الصلاة','zakat':'الزكاة','hajj':'الحج','peace':'السلام','war':'القتال','love':'الحب','death':'الموت','life':'الحياة','muhammad':'محمد','musa':'موسى','moses':'موسى','isa':'عيسى','jesus':'عيسى','ibrahim':'إبراهيم','abraham':'إبراهيم','yusuf':'يوسف','joseph':'يوسف','nuh':'نوح','noah':'نوح','firaun':'فرعون','pharaoh':'فرعون' };
    return map[word.toLowerCase()] || null;
}

async function surahNameToNumber(input) {
    if (/^\d+$/.test(input)) return parseInt(input);
    const clean = input.toLowerCase().replace(/^(al-|ar-|as-|ash-|at-|az-|an-)/, '').replace(/^(al-|ar-|as-|ash-|at-|az-|an-)/, '');
    return SURAH_NAMES[clean] || SURAH_NAMES[input.toLowerCase()] || SURAH_NAMES['al-' + clean] || null;
}

async function searchQuranText(query, language) {
    const edition = language === 'arabic' ? 'quran-simple-clean' : 'en.sahih';
    const cleanQuery = language === 'arabic' ? stripArabicDiacritics(query) : query;
    if (!cleanQuery) return { error: 'Empty query.' };
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/${edition}`;
    let response;
    try { response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000); }
    catch { return { error: 'Search unavailable.' }; }
    let data;
    try { data = await response.json(); } catch { return { error: 'Search unavailable.' }; }
    const matches = data?.data?.matches;
    if (Array.isArray(matches) && matches.length > 0) {
        return { count: data.data.count || matches.length, matches: matches.slice(0, 10).map(m => ({ surahNumber: m.surah?.number, surahName: m.surah?.englishName, ayah: m.numberInSurah, text: m.text })) };
    }
    return { count: 0, matches: [] };
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
        return { surahName: arabic?.surah?.englishName || `Surah ${surah}`, arabicText: arabic?.text || '', englishText: english?.text || '', revelationType: arabic?.surah?.revelationType || '', juz: arabic?.juz || '', page: arabic?.page || '' };
    }
    return { error: `Could not find Surah ${surah} verse ${ayah}.` };
}

async function autoSearchQuran(userMessage) {
    const msg = userMessage.toLowerCase();
    let searchContext = '';

    const verseMatch = userMessage.match(/(?:verse|ayah|ayat)\s*(\d+)[\s,]*(?:of|in|from)?\s*(?:surah\s*)?(\d+|[\w'-]+)/i);
    const verseMatch2 = userMessage.match(/(?:surah)\s*(\d+|[\w'-]+)[\s,]*(?:verse|ayah|ayat)\s*(\d+)/i);

    if (verseMatch || verseMatch2) {
        let surah, ayah;
        if (verseMatch) { ayah = verseMatch[1]; surah = verseMatch[2]; }
        else { surah = verseMatch2[1]; ayah = verseMatch2[2]; }
        const surahNum = await surahNameToNumber(surah);
        if (surahNum && parseInt(ayah) > 0) {
            try {
                const v = await getVerse(surahNum, parseInt(ayah));
                if (v && !v.error) {
                    searchContext += `\n\nVERSE LOOKUP RESULT (from Quran API):\nSurah ${v.surahName} (${surahNum}), Ayah ${ayah}\nArabic: ${v.arabicText}\nEnglish: ${v.englishText}\nJuz: ${v.juz}, Page: ${v.page}`;
                }
            } catch (e) {}
        }
    }

    let searchWord = null;
    const patterns = [
        /where\s+(?:does|is|do)\s+["']?([^"'?]+?)["']?\s+(?:appear|mentioned|found|in)/i,
        /(?:is|are)\s+["']?([^"'?]+?)["']?\s+(?:in|mentioned|found)/i,
        /which\s+surah\s+(?:mentions|has|contains)\s+["']?([^"'?]+?)["']?/i,
        /what\s+surah\s+(?:mentions|has|contains)\s+["']?([^"'?]+?)["']?/i,
        /(?:find|search|look up)\s+["']?([^"'?]+?)["']?/i,
        /(?:list|show).{0,20}surah.{0,20}([\w'-]{3,})/i,
    ];
    for (const p of patterns) {
        const m = userMessage.match(p);
        if (m && m[1] && m[1].length > 1 && m[1].length < 50) { searchWord = m[1].trim(); break; }
    }

    const commonWords = ['abdullah','rahman','raheem','jinn','satan','shaytan','paradise','hell','mercy','patience','sabr','zakat','hajj','salah','prayer','muhammad','musa','moses','isa','jesus','ibrahim','abraham','yusuf','joseph','nuh','noah','firaun','pharaoh','war','peace','love','death','life','knowledge'];
    for (const w of commonWords) {
        if (msg.includes(` ${w} `) || msg.includes(`"${w}"`) || msg.includes(` ${w}?`) || msg.includes(` ${w}'`) || msg.includes(` ${w}\n`)) {
            if (!searchWord) searchWord = w; break;
        }
    }

    const arabicMatch = userMessage.match(/[\u0600-\u06FF]{2,}/);
    if (arabicMatch && !searchWord) searchWord = arabicMatch[0];

    if (searchWord) {
        try {
            const enResults = await searchQuranText(searchWord, 'english');
            if (enResults?.matches?.length > 0) {
                searchContext += `\n\nQURAN SEARCH RESULTS for "${searchWord}" (English):\nFound ${enResults.count} matches:\n`;
                enResults.matches.forEach(m => { searchContext += `- ${m.surahName} (${m.surahNumber}):${m.ayah} — "${m.text.substring(0, 120)}..."\n`; });
            }
        } catch (e) {}

        const arabicGuess = wordToArabic(searchWord);
        if (arabicGuess) {
            try {
                const arResults = await searchQuranText(arabicGuess, 'arabic');
                if (arResults?.matches?.length > 0) {
                    searchContext += `\n\nQURAN SEARCH RESULTS for "${arabicGuess}" (Arabic):\nFound ${arResults.count} matches:\n`;
                    arResults.matches.forEach(m => { searchContext += `- ${m.surahName} (${m.surahNumber}):${m.ayah}\n`; });
                }
            } catch (e) {}
        }
    }

    return searchContext;
}

// ============================================================
// AI CALL — Gemini (free) primary, Groq (free) fallback
// ============================================================

async function callAI(messages) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const response = await fetchWithTimeout(
                'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${geminiKey}` },
                    body: JSON.stringify({ model: 'gemini-2.0-flash', messages, temperature: 0.3, max_tokens: 1000 })
                }, 15000
            );
            if (response.ok) {
                const data = await response.json();
                return data.choices?.[0]?.message?.content || null;
            }
        } catch (e) { console.error('Gemini error:', e.message); }
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        for (const model of ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']) {
            try {
                const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
                    body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1000 })
                }, 15000);
                if (response.ok) {
                    const data = await response.json();
                    return data.choices?.[0]?.message?.content || null;
                }
                if (response.status === 401 || response.status === 403) break;
            } catch (e) {}
        }
    }
    return null;
}

// ============================================================
// ENDPOINT
// ============================================================

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'AI not configured. Set GEMINI_API_KEY (free — aistudio.google.com/apikey) or GROQ_API_KEY.' });
        }

        const searchContext = await autoSearchQuran(message);

        const userMessage = searchContext
            ? `${message}\n\n[SERVER NOTE: The following data was automatically fetched from the Quran API. Use ONLY this data for verse references, Arabic text, or ayah numbers. Do NOT quote from memory.]${searchContext}`
            : message;

        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (history?.length) {
            for (const msg of history.slice(-6)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
        messages.push({ role: 'user', content: userMessage });

        const reply = await callAI(messages);

        if (!reply) return res.status(500).json({ error: 'AI service unavailable.' });

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
        const response = await fetch(ttsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) return res.status(502).send('TTS unavailable');
        const audioBuffer = await response.arrayBuffer();
        res.set('Content-Type', 'audio/mpeg');
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(Buffer.from(audioBuffer));
    } catch (error) {
        return res.status(500).send('TTS failed');
    }
});

app.listen(PORT, () => {
    console.log(`\n  Baca server running on port ${PORT}`);
    console.log(`  AI: ${process.env.GEMINI_API_KEY ? 'Gemini 2.0 Flash (free)' : process.env.GROQ_API_KEY ? 'Groq (free)' : 'NOT CONFIGURED'}\n`);
});
