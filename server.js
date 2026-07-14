/* ============================================================
   BACA — server.js
   Serves static files + provides AI chat API
   Uses Google Gemini (free tier — 15 requests/minute, no payment)
   Run: node server.js  (then open http://localhost:3000)
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

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website.

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
- A link: [Read Surah X](mushaf.html)

When a user types an Arabic word, tell them which surah/ayah it likely appears in.

Keep responses concise, warm, helpful. Use emojis sparingly. Respect Islamic etiquette. Max 3-4 paragraphs.`;

// ============================================================
// AI CHAT ENDPOINT — uses Google Gemini (free)
// Get your free API key at: https://aistudio.google.com/app/apikey
// ============================================================

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'AI not configured. Set GEMINI_API_KEY environment variable.' });
        }

        // Build conversation for Gemini
        let conversationHistory = '';
        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                if (msg.role === 'user') {
                    conversationHistory += `User: ${msg.content}\n`;
                } else {
                    conversationHistory += `Assistant: ${msg.content}\n`;
                }
            }
        }

        const prompt = `${SYSTEM_PROMPT}\n\n${conversationHistory}User: ${message}\nAssistant:`;

        // Call Google Gemini API (free tier)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API error:', response.status, errText);
            return res.status(500).json({ error: 'AI service unavailable' });
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response.';

        return res.status(200).json({ reply: reply.trim() });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Failed to get AI response' });
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
