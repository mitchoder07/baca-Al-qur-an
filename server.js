/* ============================================================
   BACA — server.js
   Serves static files + provides AI chat API
   Uses Groq (free, fast, OpenAI-compatible, no quota issues)
   Get your free API key at: https://console.groq.com/keys
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
- A link with the surah number: [Read Surah Al-Baqarah](mushaf.html#surah=2) or [Read Surah Ya-Sin](mushaf.html#surah=36)
  Always include #surah=NUMBER at the end of the mushaf.html link so it opens the correct surah.
  Surah numbers: Al-Fatihah=1, Al-Baqarah=2, Ali Imran=3, An-Nisa=4, Al-Maidah=5, Al-Anam=6, Al-Araf=7, Al-Anfal=8, At-Tawbah=9, Yunus=10, Hud=11, Yusuf=12, Ar-Rad=13, Ibrahim=14, Al-Hijr=15, An-Nahl=16, Al-Isra=17, Al-Kahf=18, Maryam=19, Ta-Ha=20, Al-Anbiya=21, Al-Hajj=22, Al-Muminun=23, An-Nur=24, Al-Furqan=25, Ash-Shuara=26, An-Naml=27, Al-Qasas=28, Al-Ankabut=29, Ar-Rum=30, Luqman=31, As-Sajdah=32, Al-Ahzab=33, Saba=34, Fatir=35, Ya-Sin=36, As-Saffat=37, Sad=38, Az-Zumar=39, Ghafir=40, Fussilat=41, Ash-Shura=42, Az-Zukhruf=43, Ad-Dukhan=44, Al-Jathiyah=45, Al-Ahqaf=46, Muhammad=47, Al-Fath=48, Al-Hujurat=49, Qaf=50, Adh-Dhariyat=51, At-Tur=52, An-Najm=53, Al-Qamar=54, Ar-Rahman=55, Al-Waqiah=56, Al-Hadid=57, Al-Mujadila=58, Al-Hashr=59, Al-Mumtahanah=60, As-Saff=61, Al-Jumuah=62, Al-Munafiqun=63, At-Taghabun=64, At-Talaq=65, At-Tahrim=66, Al-Mulk=67, Al-Qalam=68, Al-Haqqah=69, Al-Maarij=70, Nuh=71, Al-Jinn=72, Al-Muzzammil=73, Al-Muddaththir=74, Al-Qiyamah=75, Al-Insan=76, Al-Mursalat=77, An-Naba=78, An-Naziat=79, Abasa=80, At-Takwir=81, Al-Infitar=82, Al-Mutaffifin=83, Al-Inshiqaq=84, Al-Buruj=85, At-Tariq=86, Al-Ala=87, Al-Ghashiyah=88, Al-Fajr=89, Al-Balad=90, Ash-Shams=91, Al-Layl=92, Ad-Duha=93, Ash-Sharh=94, At-Tin=95, Al-Alaq=96, Al-Qadr=97, Al-Bayyinah=98, Az-Zalzalah=99, Al-Adiyat=100, Al-Qariah=101, At-Takathur=102, Al-Asr=103, Al-Humazah=104, Al-Fil=105, Quraysh=106, Al-Maun=107, Al-Kawthar=108, Al-Kafirun=109, An-Nasr=110, Al-Masad=111, Al-Ikhlas=112, Al-Falaq=113, An-Nas=114

When a user types an Arabic word, tell them which surah/ayah it likely appears in.

Keep responses concise, warm, helpful. Use emojis sparingly. Respect Islamic etiquette. Max 3-4 paragraphs.`;

// ============================================================
// AI CHAT ENDPOINT — uses Groq (free, OpenAI-compatible)
// ============================================================

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'AI not configured. Set GROQ_API_KEY environment variable.' });
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

        // Call Groq API (OpenAI-compatible, free tier)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq API error:', response.status, errText);
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
