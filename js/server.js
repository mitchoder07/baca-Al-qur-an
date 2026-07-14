/* ============================================================
   BACA — server.js
   Serves static files + provides AI chat API using Z.AI
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
// AI CHAT ENDPOINT
// ============================================================

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Build conversation messages
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }

        messages.push({ role: 'user', content: message });

        // Call Z.AI API
        const response = await fetch('https://internal-api.z.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer Z.ai',
                'X-Z-AI-From': 'Z',
                'X-Token': process.env.ZAI_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMGQyZDM2YzQtMjY1Zi00M2FlLWEwMGUtNWVhN2M3NDllN2E4IiwiY2hhdF9pZCI6ImNoYXQtOTM4M2E3ODYtZGNhZS00MmQ3LWE1ZjMtYWM5NjI3N2E0MmIzIiwicGxhdGZvcm0iOiJ6YWkifQ.hzux1G1FIxgqNcxQfdjilCNZ5JqghloGhRnVdTLimPg',
                'X-Chat-Id': 'chat-9383a786-dcae-42d7-a5f3-ac96277a42b3',
                'X-User-Id': '0d2d36c4-265f-43ae-a00e-5ea7c749e7a8'
            },
            body: JSON.stringify({
                model: 'glm-4-flash',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                thinking: { type: 'disabled' }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Z.AI API error:', response.status, errText);
            return res.status(500).json({ error: 'AI service unavailable' });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'I could not generate a response.';

        return res.status(200).json({ reply: reply });
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
