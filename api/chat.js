/* ============================================================
   BACA — Vercel Serverless Function for AI Chat (v2)
   
   AI Providers (all FREE):
   1. Google Gemini 2.0 Flash — 1,500 req/day free
   2. OpenRouter — DeepSeek R1, Nemotron 550B, Qwen3 (free tier)
   3. Groq — Llama 3.3 70B (free fallback)
   
   Get FREE API keys:
   - Gemini:   https://aistudio.google.com/apikey
   - OpenRouter: https://openrouter.ai/keys (no credit card)
   - Groq:     https://console.groq.com/keys
   
   Set in Vercel env: GEMINI_API_KEY, OPENROUTER_API_KEY, GROQ_API_KEY
   
   v2 changes: Quran.com API v4 search with pagination,
   server-side stats, surah-specific search, smarter detection.
   ============================================================ */

const SYSTEM_PROMPT = `You are "Baca AI", the assistant for the Baca Quran website (baca-al-qur-an.vercel.app).

You are knowledgeable, warm, and deeply respectful of Islamic etiquette.

ABOUT BACA:
Baca is a Quran reading platform with: Mushaf Reader (604-page Uthmani script, tajweed colors, word-by-word audio), 34+ reciters (including Warsh & Qalun riwayat), Daily Adhkar with audio, How to Pray guide, Reading Journey stats, tafsir (Ibn Kathir, Maarif, Jalalayn), 17+ translations, and share-as-image.

ABOUT THE DEVELOPER:
Baca was built by Abdullah Yusuf, a cybersecurity graduate from Nigeria. He built Baca with love for the Ummah.

QURAN FACTS:
114 surahs, 6,236 verses, 30 juz, 60 hizbs. Al-Fatihah=1, Al-Baqarah=2 (286, longest), Al-Kawthar=108 (3, shortest). Ayat al-Kursi = 2:255.

When mentioning a surah, include: [Read Surah Name](mushaf.html#surah=NUMBER)

HOW TO USE THE SEARCH RESULTS AND STATISTICS:
The server pre-fetches real data from the Quran API and computes statistics BEFORE sending you the user's question.

If the user's message includes "QURAN SEARCH RESULTS", "VERSE LOOKUP RESULT", "QURAN STATISTICS", or "SURAH-SPECIFIC SEARCH":
- That data is FACTUAL and was computed server-side from the real Quran.
- TRUST the statistics (total matches, unique surahs count, list of surahs) — they are accurate.
- Use ONLY the provided data. Do NOT add verses from memory.
- Present the statistics clearly in your answer. Do not second-guess the numbers.
- If asked "how many surahs", quote the UNIQUE_SURAHS count from the statistics.
- If asked "is X in surah Y", check the surah-specific search results and give a clear YES or NO.

If no search results were provided, answer from your general knowledge but NEVER fabricate verse text, ayah numbers, or Arabic quotations.

CRITICAL RULES:
1. NEVER fabricate Arabic text or translations
2. If search results are provided, use ONLY those — trust the computed statistics
3. If no results and you're unsure, say "I'm not certain — please use the search in the app"
4. Be helpful, warm, and concise (max 3-4 paragraphs)
5. Use SWT after Allah, PBUH after Prophet Muhammad
6. Never issue fatwas — direct fiqh questions to qualified scholars`;

// ============================================================
// UTILITIES
// ============================================================

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timeout); }
}

function stripArabicDiacritics(text) {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D4-\u08FF]/g, '').trim();
}

const SURAH_NAMES = { 'fatihah':1,'al-fatihah':1,'fatiha':1,'baqarah':2,'al-baqarah':2,'imran':3,'ali imran':3,'aal-imran':3,'nisa':4,'an-nisa':4,'maidah':5,'al-maidah':5,'anam':6,'al-anam':6,'araf':7,'al-araf':7,'anfal':8,'al-anfal':8,'tawbah':9,'at-tawbah':9,'yunus':10,'hud':11,'yusuf':12,'rad':13,'ar-rad':13,'ibrahim':14,'hijr':15,'al-hijr':15,'nahl':16,'an-nahl':16,'isra':17,'al-isra':17,'kahf':18,'al-kahf':18,'maryam':19,'ta-ha':20,'taha':20,'anbiya':21,'al-anbiya':21,'hajj':22,'al-hajj':22,'muminun':23,'al-muminun':23,'nur':24,'an-nur':24,'furqan':25,'al-furqan':25,'shuara':26,'ash-shuara':26,'naml':27,'an-naml':27,'qasas':28,'al-qasas':28,'ankabut':29,'al-ankabut':29,'rum':30,'ar-rum':30,'luqman':31,'sajdah':32,'as-sajdah':32,'ahzab':33,'al-ahzab':33,'saba':34,'fatir':35,'ya-sin':36,'yasin':36,'ya sin':36,'saffat':37,'as-saffat':37,'sad':38,'zumar':39,'az-zumar':39,'ghafir':40,'fussilat':41,'shura':42,'ash-shura':42,'zukhruf':43,'az-zukhruf':43,'dukhan':44,'ad-dukhan':44,'jathiyah':45,'al-jathiyah':45,'ahqaf':46,'al-ahqaf':46,'muhammad':47,'fath':48,'al-fath':48,'hujurat':49,'al-hujurat':49,'qaf':50,'dhariyat':51,'tur':52,'at-tur':52,'najm':53,'an-najm':53,'qamar':54,'al-qamar':54,'rahman':55,'ar-rahman':55,'waqiah':56,'al-waqiah':56,'hadid':57,'al-hadid':57,'mujadila':58,'hashr':59,'al-hashr':59,'mumtahanah':60,'saff':61,'as-saff':61,'jumuah':62,'al-jumuah':62,'munafiqun':63,'taghabun':64,'talaq':65,'at-talaq':65,'tahrim':66,'at-tahrim':66,'mulk':67,'al-mulk':67,'qalam':68,'al-qalam':68,'haqqah':69,'al-haqqah':69,'maarij':70,'al-maarij':70,'nuh':71,'jinn':72,'al-jinn':72,'muzzammil':73,'al-muzzammil':73,'muddaththir':74,'al-muddaththir':74,'qiyamah':75,'insan':76,'al-insan':76,'mursalat':77,'naba':78,'an-naba':78,'naziat':79,'abasa':80,'takwir':81,'at-takwir':81,'infitar':82,'mutaffifin':83,'inshiqaq':84,'buruj':85,'tariq':86,'at-tariq':86,'ala':87,'al-ala':87,'ghashiyah':88,'fajr':89,'al-fajr':89,'balad':90,'al-balad':90,'shams':91,'layl':92,'al-layl':92,'duha':93,'ad-duha':93,'sharh':94,'ash-sharh':94,'tin':95,'at-tin':95,'alaq':96,'al-alaq':96,'qadr':97,'al-qadr':97,'bayyinah':98,'zalzalah':99,'adiyat':100,'qariah':101,'takathur':102,'asr':103,'al-asr':103,'humazah':104,'fil':105,'al-fil':105,'quraysh':106,'maun':107,'al-maun':107,'kawthar':108,'al-kawthar':108,'kafirun':109,'nasr':110,'an-nasr':110,'masad':111,'ikhlas':112,'al-ikhlas':112,'falaq':113,'al-falaq':113,'nas':114,'an-nas':114 };

// Expanded English-to-Arabic word map for better search coverage
function wordToArabic(word) {
    const map = {
        'abdullah':'عبد الله','abd allah':'عبد الله','servant of allah':'عبد الله',
        'rahman':'الرحمن','rahmaan':'الرحمن','raheem':'الرحيم','rahim':'الرحيم',
        'mercy':'رحمة','merciful':'الرحمن','compassionate':'الرحمن',
        'patience':'صبر','sabr':'صبر','steadfast':'صبر',
        'jinn':'الجن',
        'satan':'الشيطان','shaytan':'الشيطان','devil':'الشيطان','iblis':'إبليس',
        'paradise':'الجنة','jannah':'الجنة','garden':'الجنة','heaven':'السماء',
        'hell':'النار','jahannam':'جهنم','fire':'النار',
        'knowledge':'العلم','ilm':'العلم',
        'prayer':'الصلاة','salah':'الصلاة','salat':'الصلاة',
        'zakat':'الزكاة','charity':'الزكاة',
        'hajj':'الحج','pilgrimage':'الحج',
        'peace':'السلام','salam':'السلام',
        'war':'القتال','fight':'القتال','battle':'القتال',
        'love':'الحب','mahabbah':'الحب',
        'death':'الموت','mawt':'الموت',
        'life':'الحياة','hayat':'الحياة',
        'truth':'الحق','haqq':'الحق',
        'light':'النور','noor':'النور','nur':'النور',
        'guidance':'الهدى','huda':'الهدى','hidayah':'هداية',
        'faith':'الإيمان','iman':'الإيمان','belief':'الإيمان',
        'forgiveness':'المغفرة','maghfirah':'المغفرة','forgive':'غفر',
        'book':'الكتاب','kitab':'الكتاب',
        'quran':'القرآن','book of allah':'القرآن',
        'prophet':'النبي','nabi':'النبي','messenger':'الرسول','rasul':'الرسول',
        'muhammad':'محمد','ahmad':'أحمد',
        'musa':'موسى','moses':'موسى','moosa':'موسى',
        'isa':'عيسى','jesus':'عيسى',
        'ibrahim':'إبراهيم','abraham':'إبراهيم',
        'yusuf':'يوسف','joseph':'يوسف',
        'nuh':'نوح','noah':'نوح',
        'dawud':'داود','david':'داود',
        'sulayman':'سليمان','solomon':'سليمان',
        'firaun':'فرعون','pharaoh':'فرعون',
        'mariam':'مريم','mary':'مريم',
        'yahya':'يحيى','john':'يحيى',
        'ismail':'إسماعيل','ishmael':'إسماعيل',
        'ishaq':'إسحاق','isaac':'إسحاق',
        'yaqub':'يعقوب','jacob':'يعقوب',
        'harun':'هارون','aaron':'هارون',
        'ayyub':'أيوب','job':'أيوب',
        'yunus':'يونس','jonah':'يونس',
        'luqman':'لقمان',
        'qarun':'قارون','korah':'قارون',
        'haman':'هامان',
        'baqarah':'البقرة','cow':'البقرة','calf':'العجل',
        'tree':'الشجرة','water':'الماء','earth':'الأرض',
        'sun':'الشمس','moon':'القمر','star':'النجم','stars':'النجوم',
        'day':'النهار','night':'الليل','morning':'الصبح','fajr':'الفجر',
        'angel':'ملك','malaikah':'ملائكة','angels':'الملائكة',
        'jibreel':'جبريل','gabriel':'جبريل',
        'throne':'العرش','arsh':'العرش',
        'creation':'الخلق','promise':'الوعد',
        'justice':'العدل','adl':'العدل',
        'oppression':'الظلم','dhulm':'الظلم','zulm':'الظلم',
        'believer':'المؤمن','believers':'المؤمنون',
        'disbeliever':'الكافر','disbelievers':'الكافرون',
        'hypocrite':'المنافق','hypocrites':'المنافقون',
        'repentance':'التوبة','tawbah':'التوبة',
        'gratitude':'الشكر','shukr':'الشكر',
        'fear':'الخوف','taqwa':'التقوى',
        'sign':'الآية','signs':'الآيات','ayat':'الآيات',
        'people':'الناس','mankind':'الناس',
    };
    return map[word.toLowerCase()] || null;
}

async function surahNameToNumber(input) {
    if (!input) return null;
    input = input.trim();
    if (/^\d+$/.test(input)) {
        const n = parseInt(input);
        return (n >= 1 && n <= 114) ? n : null;
    }
    const clean = input.toLowerCase().replace(/^(al-|ar-|as-|ash-|at-|az-|an-)/, '').replace(/^(al-|ar-|as-|ash-|at-|az-|an-)/, '').trim();
    return SURAH_NAMES[clean] || SURAH_NAMES[input.toLowerCase()] || SURAH_NAMES['al-' + clean] || SURAH_NAMES[clean.replace(/\s+/g, '-')] || null;
}

// ============================================================
// QURAN.COM API v4 — Primary search (better, paginated)
// ============================================================

async function searchQuranComV4(query, options = {}) {
    const { maxPages = 3, perPage = 50, language = 'en' } = options;
    
    const allResults = [];
    let totalResults = 0;
    
    for (let page = 1; page <= maxPages; page++) {
        const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=${perPage}&page=${page}&language=${language}`;
        let response;
        try {
            response = await fetchWithTimeout(url, {
                headers: { 'Accept': 'application/json' }
            }, 8000);
        } catch { break; }
        
        let data;
        try { data = await response.json(); } catch { break; }
        
        const search = data?.search;
        if (!search) break;
        
        totalResults = search.total_results || 0;
        const results = search.results || [];
        
        if (results.length === 0) break;
        
        for (const r of results) {
            allResults.push({
                verseKey: r.verse_key,
                surahNumber: parseInt(r.verse_key?.split(':')[0]) || 0,
                ayah: parseInt(r.verse_key?.split(':')[1]) || 0,
                text: r.text || '',
                translations: (r.translations || []).map(t => ({
                    text: t.text?.replace(/<[^>]*>/g, '') || '',
                    name: t.name || ''
                }))
            });
        }
        
        if (page >= search.total_pages || results.length < perPage) break;
    }
    
    return { totalResults, matches: allResults };
}

// ============================================================
// AL-QURAN CLOUD API — Fallback search + verse lookup
// ============================================================

async function searchAlQuranCloud(query, language) {
    const edition = language === 'arabic' ? 'quran-simple-clean' : 'en.sahih';
    const cleanQuery = language === 'arabic' ? stripArabicDiacritics(query) : query;
    if (!cleanQuery) return { totalResults: 0, matches: [] };
    
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/${edition}`;
    let response;
    try {
        response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 8000);
    } catch { return { totalResults: 0, matches: [], error: 'Search unavailable.' }; }
    
    let data;
    try { data = await response.json(); } catch { return { totalResults: 0, matches: [] }; }
    
    const matches = data?.data?.matches;
    const count = data?.data?.count || 0;
    
    if (Array.isArray(matches) && matches.length > 0) {
        return {
            totalResults: count,
            matches: matches.map(m => ({
                surahNumber: m.surah?.number,
                surahName: m.surah?.englishName,
                ayah: m.numberInSurah,
                verseKey: `${m.surah?.number}:${m.numberInSurah}`,
                text: m.text,
                translations: []
            }))
        };
    }
    return { totalResults: count, matches: [] };
}

// Search within a specific surah only
async function searchInSurah(query, surahNumber, language) {
    const edition = language === 'arabic' ? 'quran-simple-clean' : 'en.sahih';
    const cleanQuery = language === 'arabic' ? stripArabicDiacritics(query) : query;
    if (!cleanQuery) return { totalResults: 0, matches: [] };
    
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/${surahNumber}/${edition}`;
    let response;
    try {
        response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 8000);
    } catch { return { totalResults: 0, matches: [], error: 'Search unavailable.' }; }
    
    let data;
    try { data = await response.json(); } catch { return { totalResults: 0, matches: [] }; }
    
    const matches = data?.data?.matches;
    const count = data?.data?.count || 0;
    
    if (Array.isArray(matches) && matches.length > 0) {
        return {
            totalResults: count,
            matches: matches.map(m => ({
                surahNumber: m.surah?.number,
                surahName: m.surah?.englishName,
                ayah: m.numberInSurah,
                verseKey: `${m.surah?.number}:${m.numberInSurah}`,
                text: m.text,
                translations: []
            }))
        };
    }
    return { totalResults: count, matches: [] };
}

async function getVerse(surah, ayah) {
    const url = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/editions/quran-uthmani,en.sahih`;
    let response;
    try { response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 8000); }
    catch { return { error: 'Verse lookup unavailable.' }; }
    let data;
    try { data = await response.json(); } catch { return { error: 'Verse lookup unavailable.' }; }
    const editions = data?.data;
    if (Array.isArray(editions) && editions.length >= 1) {
        const arabic = editions.find(e => e.edition?.identifier === 'quran-uthmani');
        const english = editions.find(e => e.edition?.identifier === 'en.sahih');
        return {
            surahName: arabic?.surah?.englishName || `Surah ${surah}`,
            surahNumber: surah,
            arabicText: arabic?.text || '',
            englishText: english?.text || '',
            revelationType: arabic?.surah?.revelationType || '',
            juz: arabic?.juz || '',
            page: arabic?.page || ''
        };
    }
    return { error: `Could not find Surah ${surah} verse ${ayah}.` };
}

// ============================================================
// SMART SEARCH — Combines both APIs, computes statistics
// ============================================================

function computeStatistics(matches) {
    const uniqueSurahs = new Map();
    for (const m of matches) {
        const num = m.surahNumber;
        if (!uniqueSurahs.has(num)) {
            uniqueSurahs.set(num, {
                number: num,
                name: m.surahName || `Surah ${num}`,
                matchCount: 0,
                ayahs: []
            });
        }
        const s = uniqueSurahs.get(num);
        s.matchCount++;
        s.ayahs.push(m.ayah);
    }
    
    const surahList = Array.from(uniqueSurahs.values()).sort((a, b) => a.number - b.number);
    
    return {
        totalMatches: matches.length,
        uniqueSurahCount: surahList.length,
        surahs: surahList
    };
}

async function autoSearchQuran(userMessage) {
    const msg = userMessage.toLowerCase();
    let searchContext = '';

    // ── 1. VERSE LOOKUP (e.g., "verse 255 of surah 2") ──
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

    // ── 2. DETECT SURAH-SPECIFIC SEARCH ("is X in surah Y?") ──
    let surahSpecificSearch = null;
    const surahSpecificPatterns = [
        /(?:is|are|does|do)\s+["']?([^"']+?)["']?\s+(?:in|mentioned|found|appear)\s+(?:in\s+)?(?:surah|chapter)\s+(\d+|[\w'\s-]+?)(?:\s*\?|$)/i,
        /(?:surah|chapter)\s+(\d+|[\w'\s-]+?)\s+(?:.*?\b(?:have|has|contain|mention|include)\b.*?)\s+["']?([^"']+?)["']?\s*(?:\?|$)/i,
        /(?:in|within)\s+(?:surah|chapter)\s+(\d+|[\w'\s-]+?)\s+.*?(?:is|are|does|do)\s+["']?([^"']+?)["']?\s*(?:\?|mentioned|found|appear|$)/i,
    ];
    
    for (const p of surahSpecificPatterns) {
        const m = userMessage.match(p);
        if (m) {
            let searchWord, surahInput;
            if (p === surahSpecificPatterns[0]) {
                searchWord = m[1]?.trim();
                surahInput = m[2]?.trim();
            } else {
                surahInput = m[1]?.trim();
                searchWord = m[2]?.trim();
            }
            if (searchWord && surahInput) {
                const surahNum = await surahNameToNumber(surahInput);
                if (surahNum) {
                    surahSpecificSearch = { word: searchWord, surahNumber: surahNum, surahInput };
                }
            }
            break;
        }
    }

    // ── 3. DETECT SEARCH WORD (general) ──
    let searchWord = null;
    const patterns = [
        /how\s+many\s+(?:surahs?|chapters?|verses?|ayahs?|times?)\s+(?:is|are|does|do)\s+["']?([^"']+?)["']?\s+(?:in|mentioned|found|appear)/i,
        /(?:how\s+many\s+(?:times?|surahs?|verses?))?\s*(?:where|which\s+surahs?)\s+(?:does|is|do)\s+["']?([^"']+?)["']?\s+(?:appear|mentioned|found|in|occur)/i,
        /(?:is|are)\s+["']?([^"']+?)["']?\s+(?:in|mentioned|found|in\s+the\s+quran)/i,
        /which\s+surahs?\s+(?:mentions?|has|have|contains?|includes?)\s+["']?([^"']+?)["']?/i,
        /what\s+surahs?\s+(?:mentions?|has|have|contains?|includes?)\s+["']?([^"']+?)["']?/i,
        /(?:find|search|look\s*up)\s+["']?([^"']+?)["']?\s*(?:in\s+(?:the\s+)?quran)?$/i,
        /["']([^"']{2,40})["']\s+(?:in|mentioned|found|appear)/i,
    ];
    for (const p of patterns) {
        const m = userMessage.match(p);
        if (m && m[1] && m[1].length > 1 && m[1].length < 60) {
            searchWord = m[1].trim().replace(/[?.,!]+$/, '');
            break;
        }
    }

    // Check common words list (expanded)
    const commonWords = [
        'abdullah','rahman','raheem','jinn','satan','shaytan','iblis',
        'paradise','jannah','hell','jahannam','mercy','patience','sabr',
        'zakat','hajj','salah','prayer','muhammad','musa','moses','isa',
        'jesus','ibrahim','abraham','yusuf','joseph','nuh','noah',
        'firaun','pharaoh','war','peace','love','death','life','knowledge',
        'truth','light','noor','guidance','faith','iman','forgiveness',
        'quran','book','prophet','messenger','angel','malaikah','jibreel',
        'gabriel','mariam','mary','dawud','david','sulayman','solomon',
        'yahya','john','ismail','ishaq','yaqub','jacob','harun','aaron',
        'ayyub','job','yunus','jonah','luqman','qarun','haman',
        'tawbah','repentance','taqwa','gratitude','shukr','justice',
        'oppression','zulm','dhulm','believer','disbeliever','hypocrite',
        'creation','throne','arsh','sign','ayah','ayat',
    ];
    if (!searchWord) {
        for (const w of commonWords) {
            if (msg.includes(` ${w} `) || msg.includes(`"${w}"`) || msg.includes(`'${w}'`) || msg.includes(` ${w}?`) || msg.includes(` ${w}'`) || msg.includes(` ${w}\n`) || msg.endsWith(` ${w}`)) {
                searchWord = w;
                break;
            }
        }
    }

    // Detect Arabic text in the message
    const arabicMatch = userMessage.match(/[\u0600-\u06FF]{2,}/);
    if (arabicMatch && !searchWord) searchWord = arabicMatch[0];

    // ── 4. EXECUTE SEARCHES ──
    let allMatches = [];
    let totalApiCount = 0;
    const isCountQuestion = /how\s+many/i.test(userMessage);
    const maxPages = isCountQuestion ? 6 : 2; // More pages for counting questions

    if (searchWord) {
        // Primary: Quran.com API v4 (better search, paginated)
        try {
            const quranComResults = await searchQuranComV4(searchWord, { maxPages, perPage: 50, language: 'en' });
            if (quranComResults.matches.length > 0) {
                totalApiCount = quranComResults.totalResults;
                allMatches = quranComResults.matches;
            }
        } catch (e) {}

        // If Quran.com returned nothing, try alquran.cloud
        if (allMatches.length === 0) {
            try {
                const cloudResults = await searchAlQuranCloud(searchWord, 'english');
                if (cloudResults.matches.length > 0) {
                    totalApiCount = cloudResults.totalResults;
                    allMatches = cloudResults.matches;
                }
            } catch (e) {}
        }

        // Also try Arabic search for better coverage
        const arabicGuess = wordToArabic(searchWord);
        if (arabicGuess) {
            try {
                const arResults = await searchAlQuranCloud(arabicGuess, 'arabic');
                if (arResults.matches.length > 0) {
                    // Merge Arabic results, avoiding duplicates
                    const existingKeys = new Set(allMatches.map(m => m.verseKey));
                    for (const m of arResults.matches) {
                        if (!existingKeys.has(m.verseKey)) {
                            allMatches.push(m);
                            existingKeys.add(m.verseKey);
                        }
                    }
                    if (arResults.totalResults > totalApiCount) {
                        totalApiCount = arResults.totalResults;
                    }
                }
            } catch (e) {}
        }

        // Compute statistics from all collected matches
        const stats = computeStatistics(allMatches);
        
        searchContext += `\n\nQURAN SEARCH RESULTS for "${searchWord}":\n`;
        searchContext += `\nQURAN STATISTICS (computed server-side — TRUST these numbers):\n`;
        searchContext += `- Total matches found: ${totalApiCount || stats.totalMatches}\n`;
        searchContext += `- Unique surahs containing "${searchWord}": ${stats.uniqueSurahCount}\n`;
        searchContext += `- Surahs list: ${stats.surahs.map(s => `${s.name} (${s.number}) — ${s.matchCount} match${s.matchCount > 1 ? 'es' : ''}`).join(', ')}\n`;
        
        // Include sample verses (first 15)
        const sampleMatches = allMatches.slice(0, 15);
        if (sampleMatches.length > 0) {
            searchContext += `\nSAMPLE VERSES (first ${sampleMatches.length} of ${allMatches.length} fetched):\n`;
            for (const m of sampleMatches) {
                const displayText = m.translations?.[0]?.text || m.text;
                searchContext += `- ${m.verseKey || `${m.surahNumber}:${m.ayah}`}: "${(displayText || '').substring(0, 150)}${(displayText || '').length > 150 ? '...' : ''}"\n`;
            }
        }
        
        if (totalApiCount > stats.totalMatches) {
            searchContext += `\nNOTE: The API reports ${totalApiCount} total matches, but only ${stats.totalMatches} were fetched. The unique surah count of ${stats.uniqueSurahCount} is based on the fetched data and may be an undercount if the total is much larger.`;
        }
    }

    // ── 5. SURAH-SPECIFIC SEARCH ──
    if (surahSpecificSearch) {
        const { word, surahNumber, surahInput } = surahSpecificSearch;
        
        try {
            const result = await searchInSurah(word, surahNumber, 'english');
            
            searchContext += `\n\nSURAH-SPECIFIC SEARCH: Is "${word}" in Surah ${surahInput} (${surahNumber})?\n`;
            searchContext += `ANSWER FROM API: ${result.totalResults > 0 ? `YES — found ${result.totalResults} time(s)` : 'NO — not found in this surah'}\n`;
            
            if (result.matches.length > 0) {
                searchContext += `Matching verses:\n`;
                for (const m of result.matches.slice(0, 10)) {
                    searchContext += `- ${m.surahName || `Surah ${m.surahNumber}`}:${m.ayah} — "${(m.text || '').substring(0, 150)}"\n`;
                }
            }
            
            // Also try Arabic search in the surah
            const arabicGuess = wordToArabic(word);
            if (arabicGuess && result.totalResults === 0) {
                try {
                    const arResult = await searchInSurah(arabicGuess, surahNumber, 'arabic');
                    if (arResult.totalResults > 0) {
                        searchContext += `\nARABIC SEARCH for "${arabicGuess}" in Surah ${surahNumber}: Found ${arResult.totalResults} time(s)\n`;
                        searchContext += `ANSWER FROM API: YES — "${word}" (${arabicGuess}) IS found in Surah ${surahInput}\n`;
                    }
                } catch (e) {}
            }
        } catch (e) {
            searchContext += `\n\nSURAH-SPECIFIC SEARCH for "${word}" in Surah ${surahInput}: Search unavailable.\n`;
        }
    }

    return searchContext;
}

// ============================================================
// AI CALL — Gemini (primary) → OpenRouter (secondary) → Groq (fallback)
// ============================================================

async function callAI(messages) {
    // PRIMARY: Google Gemini 2.0 Flash (FREE — 1,500 requests/day)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
        try {
            const response = await fetchWithTimeout(
                'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${geminiKey}` },
                    body: JSON.stringify({
                        model: 'gemini-2.0-flash',
                        messages,
                        temperature: 0.2,
                        max_tokens: 1200
                    })
                }, 18000
            );
            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;
                if (content) return content;
            }
            console.error('Gemini error:', response.status, await response.text().catch(() => ''));
        } catch (e) { console.error('Gemini error:', e.message); }
    }

    // SECONDARY: OpenRouter (FREE — DeepSeek R1, Nemotron 550B, Qwen3, etc.)
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
        // Try multiple powerful free models in order
        const freeModels = [
            'deepseek/deepseek-r1:free',
            'meta-llama/llama-3.3-70b-instruct:free',
            'qwen/qwen3-235b-a22b:free',
            'nvidia/nemotron-3-ultra-550b-a55b:free',
            'openai/gpt-oss-120b:free',
            'openrouter/free'
        ];
        
        for (const model of freeModels) {
            try {
                const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openrouterKey}`,
                        'HTTP-Referer': 'https://baca-al-qur-an.vercel.app',
                        'X-Title': 'Baca AI'
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.2,
                        max_tokens: 1200
                    })
                }, 18000);
                if (response.ok) {
                    const data = await response.json();
                    let content = data.choices?.[0]?.message?.content;
                    // DeepSeek R1 may include thinking tags — strip them
                    if (content && content.includes('</think>')) {
                        content = content.split('</think>').pop().trim();
                    }
                    if (content) {
                        console.log(`OpenRouter: used model ${model}`);
                        return content;
                    }
                }
                // If rate limited (429), try next model
                if (response.status === 429) continue;
                if (response.status === 401 || response.status === 403) {
                    console.error('OpenRouter auth error:', response.status);
                    break;
                }
            } catch (e) { console.error('OpenRouter error:', e.message); }
        }
    }

    // FALLBACK: Groq (also free)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        for (const model of ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']) {
            try {
                const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
                    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 1200 })
                }, 18000);
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

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { message, history } = req.body || {};
        if (!message) return res.status(400).json({ error: 'Message is required' });

        if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: 'AI not configured. Set at least one API key in Vercel env variables:\n' +
                       '• GEMINI_API_KEY (free — aistudio.google.com/apikey)\n' +
                       '• OPENROUTER_API_KEY (free — openrouter.ai/keys)\n' +
                       '• GROQ_API_KEY (free — console.groq.com/keys)'
            });
        }

        // Auto-search Quran API before calling AI
        const searchContext = await autoSearchQuran(message);

        const userMessage = searchContext
            ? `${message}\n\n[SERVER NOTE: The following data was automatically fetched from the Quran API and statistics were computed server-side. TRUST the statistics (total matches, unique surahs count). Use ONLY this data for verse references, Arabic text, or ayah numbers. Do NOT quote from memory. Do NOT contradict the statistics.]\n${searchContext}`
            : message;

        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        if (history?.length) {
            for (const msg of history.slice(-8)) {
                messages.push({ role: msg.role, content: msg.content });
            }
        }
        messages.push({ role: 'user', content: userMessage });

        const reply = await callAI(messages);

        if (!reply) return res.status(500).json({ error: 'AI service unavailable. Please try again in a moment.' });

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Failed: ' + error.message });
    }
};
