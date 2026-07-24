/* ============================================================
   BACA — Vercel Serverless Function for TTS (Text-to-Speech)
   Lives at /api/tts.js — Vercel's file-based routing picks this
   up automatically. Proxies Arabic text to Google Translate TTS
   and returns the MP3 audio. This bypasses CORS restrictions
   that prevent the browser from calling translate.google.com
   directly.
   ============================================================ */

module.exports = async (req, res) => {
    try {
        const { text } = req.query;

        if (!text) {
            return res.status(400).send('Missing text parameter');
        }

        // Build Google Translate TTS URL
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;

        // Fetch the audio from Google
        const response = await fetch(ttsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://translate.google.com/'
            }
        });

        if (!response.ok) {
            console.error('TTS API error:', response.status, response.statusText);
            return res.status(502).send('TTS service unavailable');
        }

        // Get the audio buffer
        const audioBuffer = await response.arrayBuffer();

        // Set headers and return the audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS proxy error:', error);
        return res.status(500).send('TTS failed');
    }
};
