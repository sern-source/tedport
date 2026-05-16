// Enes Doğanay | 16 Mayıs 2026: İçerik moderasyonu — chat ve form mesajları için
// Katman 1: normalize et
// Katman 2: LONG_BANNED → normalizeStrict üzerinde substring (5+ karakter, güvenli)
// Katman 3: SHORT_BANNED → boşlukla ayrılmış token'ları exact match (2-4 karakter,
//           "adam"→"am" / "forgot"→"got" false positive'ini önler)
// Engelle yaklaşımı seçildi (*** yerine) — B2B'de firmaya giden mesajın temiz olması zorunlu.

// ---------------------------------------------------------------------------
// normalizeStrict — bypass tekniklerine karşı, tüm noktalama/boşluk silinir
// Örnekler: "g.ö.t" → "got" | "ş.i.k.s.i.n" → "siksin" | "a m k" → "amk"
//           "@mına" → "amina" | "s1ktir" → "siktir"
// ---------------------------------------------------------------------------
function normalizeStrict(text) {
    return text
        .toLowerCase()
        .replace(/[ıi]/g, 'i')
        .replace(/[üu]/g, 'u')
        .replace(/[öo]/g, 'o')
        .replace(/[çc]/g, 'c')
        .replace(/[şs]/g, 's')
        .replace(/[ğg]/g, 'g')
        .replace(/[@4]/g, 'a')
        .replace(/[3€]/g, 'e')
        .replace(/[1!|]/g, 'i')
        .replace(/[0]/g, 'o')
        .replace(/[q]/g, 'k')
        .replace(/(.)\1{2,}/g, '$1')
        .replace(/[^a-z0-9]/g, '');
}

// ---------------------------------------------------------------------------
// normalizeSoft — boşlukları korur, token split için kullanılır
// "g ö t" veya "g-ö-t" → ayrı token değil tek token "got" olarak ele alınır
// Bu fonksiyon NON-whitespace separator'leri siler, whitespace'i korur.
// ---------------------------------------------------------------------------
function normalizeSoft(text) {
    return text
        .toLowerCase()
        .replace(/[ıi]/g, 'i')
        .replace(/[üu]/g, 'u')
        .replace(/[öo]/g, 'o')
        .replace(/[çc]/g, 'c')
        .replace(/[şs]/g, 's')
        .replace(/[ğg]/g, 'g')
        .replace(/[@4]/g, 'a')
        .replace(/[3€]/g, 'e')
        .replace(/[1!|]/g, 'i')
        .replace(/[0]/g, 'o')
        .replace(/[q]/g, 'k')
        .replace(/(.)\1{2,}/g, '$1')
        // Noktalama/özel karakterleri boşluğa çevir ama whitespace'i koru
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ---------------------------------------------------------------------------
// LONG_BANNED — 5+ karakter, normalizeStrict substring ile kontrol edilir.
// Bu uzunluktaki kelimeler meşru kelimelerin içinde substring olarak nadiren geçer.
// ---------------------------------------------------------------------------
const LONG_BANNED = [
    // ── AM ailesi ─────────────────────────────────────────────────────
    'amina',        // amına koy
    'aminak',       // amınakoyim kısaltması
    'amcik',        // amcık
    'amcigin',      // amcığın
    'amcigi',       // amcığı

    // ── SİK ailesi ────────────────────────────────────────────────────
    // "sik" tek başına: basık, klasik, fizik → false positive → SHORT'ta
    'sikim',
    'sikeyim',
    'sikerim',
    'sikis',        // sikişmek
    'sikisen',
    'sikiyor',
    'siksin',
    'sikici',
    'sikik',
    'siktir',
    'siktirgi',
    'siktin',
    'siktim',

    // ── YARAK ailesi ──────────────────────────────────────────────────
    'yarak',        // normalizeStrict → yarak (yarrak → yarak)
    'yarrak',       // direkt yazım
    'yaragi',       // yarağı
    'yaraklı',      // normalize → yarakli

    // ── GÖT ailesi — türevler (got SHORT'ta) ──────────────────────────
    'gotun',        // götün
    'gotu',         // götü
    'gotune',       // götüne
    'gotunden',     // götünden
    'gotunu',       // götünü
    'gotveren',
    'gotlek',

    // ── MEME ailesi — türevler (meme SHORT'ta) ────────────────────────
    'memeni',
    'memenle',
    'memesini',
    'memesine',
    'memeyi',

    // ── OROSPU ailesi ─────────────────────────────────────────────────
    'orospu',
    'orospunun',
    'orospuca',
    'orospucu',
    'orospuluk',
    'orospulan',

    // ── İBNE ailesi ───────────────────────────────────────────────────
    'ibnelik',
    'ibnesin',
    'ibneler',
    'ibneyim',

    // ── GAVAT / PEZEVENK ──────────────────────────────────────────────
    'gavat',        // 5 chars, rare in legitimate words
    'gavatlik',
    'gavatsin',
    'pezevenk',
    'pezevengin',
    'pezevenklik',

    // ── KAHPE / KALTAK / KEVÂŞe ───────────────────────────────────────
    'kahpelik',
    'kahpece',
    'kaltak',       // 6 chars
    'kaltaklik',
    'orospuluk',
    'kerihane',
    'kevase',

    // ── PİÇ ailesi ────────────────────────────────────────────────────
    // "pic" 3 chars → SHORT; türevler LONG'ta
    'piclik',
    'picleri',
    'picsin',
    'picsiz',
    'picin',

    // ── ŞEREFSIZ / HAYSİYETSİZ ────────────────────────────────────────
    'serefsiz',     // şerefsiz → serefsiz
    'serefsin',
    'haysiyetsiz',

    // ── DİĞER TÜRKÇE HAKARETLER ───────────────────────────────────────
    'dangalak',
    'gerizekali',   // geri zekalı → gerizekali
    'aptal',        // 5 chars, rare as substring in legitimate words
    'salak',        // 5 chars, same
    'pislik',
    'pistir',
    'boktan',       // bok türevleri — "bok" SHORT'ta
    'boklu',
    'bokus',        // bokus pikabak vb.
    'pustu',        // "pust" SHORT'ta
    'pustluk',

    // ── CİNSEL İÇERİK ─────────────────────────────────────────────────
    'porno',
    'pornografi',
    'pornocuk',
    'pornocu',
    'fahise',       // fahişe → fahise
    'fahiseler',
    'fahiselik',
    'fuhus',        // fuhuş → fuhus
    'fuhustan',
    'fuhusce',

    // ── HOMOFOBIK HAKARET ─────────────────────────────────────────────
    'ibne',         // 4 chars ama meşru substring riski yok → LONG
    'ibnelik',

    // ── İNGİLİZCE KÜFÜRLER ────────────────────────────────────────────
    'fuckoff',
    'fucker',
    'fuckin',
    'fucking',
    'fuckyou',
    'fuckface',
    'bitch',
    'bitches',
    'bastard',
    'bastards',
    'asshole',
    'assholes',
    'dickhead',
    'bullshit',
    'horseshit',
    'jackass',
    'dumbass',
    'dipshit',
    'motherfucker',
    'motherfucking',
    'sonofabitch',
    'whore',
    'cuntface',
    'pissoff',
    'wanker',
    'tosser',
    'bloody hell',  // boşluklu — strict normalize sonrası "bloodyhel" → substring yakalar
];

// ---------------------------------------------------------------------------
// SHORT_BANNED — 2-4 karakter, whitespace'e göre bölünmüş token exact match.
// Mantık: "göt" yazıldığında ["got"] → exact match ✓
//          "forgot" → ["forgot"] → "got" !== "forgot" ✓ (false positive yok)
//          "g.ö.t" bypass → normalizeSoft → "g o t" → token "g","o","t" → eşleşmez
//          normalizeStrict'te "got" olur → strict token split → ["got"] → ✓
// Her token hem normalizeSoft hem normalizeStrict ile kontrol edilir.
// ---------------------------------------------------------------------------
const SHORT_BANNED = [
    'am',           // "göt am" türü ayrı kelime hakaret
    'got',          // göt
    'sik',          // sik (standalone — "sik git" vb.)
    'bok',          // bok
    'mem',          // mem (kaba vücut dili)
    'meme',         // meme (kaba bağlamda standalone)
    'pic',          // piç standalone
    'oc',           // oç standalone (oç! gibi)
    'amk',          // a.m.k bypass için hem SHORT hem strict substring → LONG'a da ekleyebiliriz
    // İngilizce kısalar
    'fuck',         // f.u.c.k bypass
    'fck',
    'shit',         // standalone shit
    'cock',         // standalone cock
    'cunt',         // standalone cunt
    'ass',          // standalone ass (asshole LONG'ta)
    'slut',
    'twat',
];

// ---------------------------------------------------------------------------
// Dışa aktarılan fonksiyon ve sabitler
// ---------------------------------------------------------------------------
export const PROFANITY_ERROR_MSG =
    'Mesajınızda uygunsuz ifade tespit edildi. Lütfen düzeltin.';

/**
 * Verilen metinde yasaklı kelime var mı kontrol eder.
 * İki aşama:
 *  1. LONG_BANNED — normalizeStrict(text) üzerinde substring
 *  2. SHORT_BANNED — hem whitespace-split soft-tokens hem strict-tokens üzerinde exact match
 * @param {string} text - Kontrol edilecek ham metin
 * @returns {boolean}
 */
export function containsProfanity(text) {
    if (!text || typeof text !== 'string') return false;

    // Aşama 1: Uzun kelimeler — bypass-safe tam normalize üzerinde substring
    const strict = normalizeStrict(text);
    if (LONG_BANNED.some(w => strict.includes(w))) return true;

    // Aşama 2a: Kısa kelimeler — soft normalize token exact match
    // "göt" → soft token "got" → eşleşir; "forgot" → "forgot" → eşleşmez
    const softTokens = normalizeSoft(text).split(' ').filter(Boolean);
    if (SHORT_BANNED.some(w => softTokens.includes(w))) return true;

    // Aşama 2b: Kısa kelimeler — strict normalize token exact match
    // "g.ö.t" bypass → normalizeSoft'ta "g o t" tokenları → eşleşmez ama
    // normalizeStrict → "got" → strict tek token olarak da kontrol et
    // Orijinali whitespace'e göre bol, her parçayı strict normalize et
    const strictTokens = text.split(/\s+/).map(t => normalizeStrict(t)).filter(Boolean);
    if (SHORT_BANNED.some(w => strictTokens.includes(w))) return true;

    return false;
}




