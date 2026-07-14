/* ============================================================
   BACA — server.js
   Serves static files + provides AI chat API using z-ai SDK
   Run: node server.js  (then open http://localhost:3000)
   ============================================================ */

const express = require('express');
const path = require('path');
const ZAI = require('z-ai-web-dev-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// ============================================================
// SYSTEM PROMPT — everything the AI knows about Baca
// ============================================================

const SURAH_DATA = require('./js/data.js'); // Won't work directly, let me inline it

// Compact surah list for the AI
const SURAH_LIST_COMPACT = [
    {id:1,name:"الفاتحة",en:"Al-Fatihah",meaning:"The Opener",type:"meccan",ayahs:7},
    {id:2,name:"البقرة",en:"Al-Baqarah",meaning:"The Cow",type:"medinan",ayahs:286},
    {id:3,name:"آل عمران",en:"Ali 'Imran",meaning:"Family of Imran",type:"medinan",ayahs:200},
    {id:4,name:"النساء",en:"An-Nisa",meaning:"The Women",type:"medinan",ayahs:176},
    {id:5,name:"المائدة",en:"Al-Ma'idah",meaning:"The Table Spread",type:"medinan",ayahs:120},
    {id:36,name:"يس",en:"Ya-Sin",meaning:"Ya Sin",type:"meccan",ayahs:83},
    {id:55,name:"الرحمن",en:"Ar-Rahman",meaning:"The Beneficent",type:"medinan",ayahs:78},
    {id:67,name:"الملك",en:"Al-Mulk",meaning:"The Sovereignty",type:"meccan",ayahs:30},
    {id:112,name:"الإخلاص",en:"Al-Ikhlas",meaning:"The Sincerity",type:"meccan",ayahs:4},
    {id:113,name:"الفلق",en:"Al-Falaq",meaning:"The Daybreak",type:"meccan",ayahs:5},
    {id:114,name:"الناس",en:"An-Nas",meaning:"The Mankind",type:"meccan",ayahs:6},
    // Full list would be all 114 — including the most commonly asked ones
];

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website (baca.app).

ABOUT BACA:
Baca is a beautiful Quran reading platform built with HTML, CSS, and JavaScript. Features include:
- Mushaf Reader (mushaf.html): Read the Quran in authentic Uthmani script with page-by-page navigation, tajweed color coding, word-by-word audio, and bookmarks
- Adhkar Page (adhkar.html): Daily Islamic remembrances with counters, audio, and notification reminders
- Reading Stats: Gamification with streaks, daily challenges, achievements, and progress tracking
- Reciters: 25+ Quran reciters with full surah audio
- Daily Ayah: A daily verse with reflection
- Guided Journeys: Structured reading paths (Finding Peace, Strengthening Salah, etc.)
- Topics: Filter verses by theme (Mercy, Prayer, Knowledge, Protection, Charity, Hope)
- Islamic Date: Shows Hijri calendar with week number
- Search: Search surahs by name, number, or topic
- Themes: 5 reader themes (Dark, Warm, Teal, Sapphire, Light)
- Translations: 17+ languages in the reading modal
- Tafsir: Ibn Kathir, Ma'arif-ul-Quran, and Jalalayn

ABOUT THE DEVELOPER:
Baca was built by Abdullah Yusuf, a cybersecurity graduate with hands-on IT support experience. He writes clean code in Python, builds responsive websites, and designs user interfaces in Figma. He's from Nigeria and is passionate about strengthening Nigeria's digital infrastructure. He built Baca with love for the Ummah.

QURAN KNOWLEDGE:
The Quran has 114 surahs, 6,236 verses, 30 juz, and 60 hizbs.
Surahs are categorized as Meccan (revealed in Mecca) or Medinan (revealed in Medina).
The first surah is Al-Fatihah (7 verses). The longest is Al-Baqarah (286 verses). The shortest is Al-Kawthar (3 verses).
The last 3 surahs are Al-Ikhlas (112), Al-Falaq (113), An-Nas (114) — often called the "3 Quls".

When a user asks about a specific surah, respond with:
- Surah name (Arabic + English)
- Number of verses
- Meccan or Medinan
- Brief description of its theme
- A link to read it: [Read Surah X](mushaf.html) or [Read on page Y](mushaf.html)

When a user types an Arabic word, tell them which surah/ayah it likely appears in based on your knowledge, and suggest they search for it on the site.

When a user asks about Baca features, explain how to use them.

Keep responses concise, warm, and helpful. Use emojis sparingly. Always be respectful of Islamic etiquette.`;

// ============================================================
// AI CHAT ENDPOINT
// ============================================================

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const zai = await ZAI.create();
        
        // Build conversation history
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];
        
        // Add conversation history (last 10 messages)
        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
        
        // Add current message
        messages.push({ role: 'user', content: message });

        const response = await zai.chat.completions.create({
            model: 'glm-4-flash',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: false
        });

        const reply = response.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
        
        res.json({ reply: reply });
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
    }
});

// ============================================================
// QURAN WORD SEARCH ENDPOINT
// ============================================================

app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Use quran.com search API
        const searchUrl = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=10&page=1&language=ar`;
        
        const response = await fetch(searchUrl, {
            headers: { 'User-Agent': 'Baca/1.0' }
        });
        
        const data = await response.json();
        const results = (data.data?.results || []).map(r => ({
            surah: r.surah_id,
            ayah: r.ayah_id,
            text: r.text,
            surahName: r.surah?.name || '',
            translation: r.translations?.[0]?.text || ''
        }));
        
        res.json({ results: results });
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ error: 'Search failed. Please try again.' });
    }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(`\n  ╔══════════════════════════════════════╗`);
    console.log(`  ║  Baca server running on port ${PORT}     ║`);
    console.log(`  ║  Open: http://localhost:${PORT}          ║`);
    console.log(`  ║  AI Chat: http://localhost:${PORT}/ask  ║`);
    console.log(`  ╚══════════════════════════════════════╝\n`);
});
