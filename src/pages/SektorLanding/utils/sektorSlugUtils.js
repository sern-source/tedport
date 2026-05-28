// Enes Doğanay | 12 Mayıs 2026: Sektör slug yardımcıları — URL↔sektör adı dönüşümü

import { SEKTORLER } from '../../Firmalar/utils/sektorData';

// Enes Doğanay | 28 Mayıs 2026: İ → i önce çevrilmeli; V8'de 'İ'.toLowerCase() = 'i\u0307' üretir → regex - koyar
export const toSlug = (str) =>
    str
        .replace(/İ/g, 'i')
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// Enes Doğanay | 12 Mayıs 2026: Slug → orijinal sektör adı
export const slugToSektor = (slug) =>
    SEKTORLER.find(s => toSlug(s) === slug) || null;

// Enes Doğanay | 12 Mayıs 2026: Tüm sektör slug'larını üret
export const SEKTOR_SLUGS = Object.fromEntries(SEKTORLER.map(s => [toSlug(s), s]));

// Enes Doğanay | 12 Mayıs 2026: SEO açıklamaları — her sektör için özel meta description
const SEKTOR_DESCRIPTIONS = {
    'Makine ve Endüstriyel Ekipmanlar': 'Makine ve endüstriyel ekipman ihaleleri — CNC tezgah, pres, konveyör, kompresör ve daha fazlası.',
    'Metal ve Metal İşleme Sanayi': 'Metal ve metal işleme ihaleleri — çelik, demir, alüminyum, sac ve profil malzeme alımları.',
    'Endüstriyel Otomasyon Sistemleri': 'Endüstriyel otomasyon ihaleleri — PLC, SCADA, robot sistemleri ve otomasyon bileşenleri.',
    'Elektrik ve Elektrik Ekipmanları': 'Elektrik ekipmanları ihaleleri — kablo, pano, sigorta, trafo ve elektrik malzemeleri.',
    'Elektronik ve Elektronik Üretim': 'Elektronik ve elektronik üretim ihaleleri — PCB, sensör, kontrol kartı ve elektronik bileşenler.',
    'Enerji ve Güç Sistemleri': 'Enerji ve güç sistemleri ihaleleri — jeneratör, UPS, solar panel ve güç kaynakları.',
    'Mekanik Sistemler ve Mühendislik': 'Mekanik sistemler ihaleleri — rulman, dişli, redüktör ve mekanik bileşen alımları.',
    'Hırdavat ve Teknik Malzemeler': 'Hırdavat ve teknik malzeme ihaleleri — vida, somun, bağlantı elemanları ve el aletleri.',
    'İnşaat ve Yapı Malzemeleri': 'İnşaat ve yapı malzemeleri ihaleleri — çimento, demir, beton, yalıtım ve yapı malzemeleri.',
    'Kimya ve Endüstriyel Kimyasallar': 'Kimya ve endüstriyel kimyasal ihaleleri — solvent, boya, kaplama ve kimyasal malzeme alımları.',
    'Plastik ve Plastik Üretimi': 'Plastik ve plastik üretim ihaleleri — granül, kalıp, plastik bileşen ve ambalaj malzemeleri.',
    'Ambalaj ve Paketleme Sistemleri': 'Ambalaj ve paketleme ihaleleri — kutu, film, bant, etiket ve paketleme ekipmanları.',
    'Lojistik ve Tedarik Zinciri': 'Lojistik ve tedarik zinciri ihaleleri — taşımacılık, depolama, forklift ve lojistik hizmetleri.',
    'Tekstil ve Tekstil Üretimi': 'Tekstil ve tekstil üretim ihaleleri — kumaş, iplik, tezgah ve konfeksiyon malzemeleri.',
    'Gıda ve Gıda Üretim Teknolojileri': 'Gıda ve gıda üretim ihaleleri — hammadde, gıda makineleri ve gıda ambalaj alımları.',
    'Otomotiv ve Otomotiv Yan Sanayi': 'Otomotiv ve otomotiv yan sanayi ihaleleri — yedek parça, bileşen ve araç alımları.',
    'Medikal ve Sağlık Teknolojileri': 'Medikal ve sağlık teknolojileri ihaleleri — tıbbi cihaz, sarf malzeme ve sağlık ekipmanları.',
    'Bilişim, Yazılım ve BT Çözümleri': 'Bilişim ve yazılım ihaleleri — sunucu, lisans, yazılım geliştirme ve BT hizmetleri.',
    'Güvenlik Sistemleri ve Teknolojileri': 'Güvenlik sistemleri ihaleleri — kamera, alarm, erişim kontrol ve güvenlik yazılımları.',
    'Endüstriyel ve Kurumsal Hizmetler': 'Endüstriyel ve kurumsal hizmet ihaleleri — bakım, onarım, temizlik ve dış kaynak hizmetleri.',
    // Enes Doğanay | 23 Mayıs 2026: 12 yeni sektör SEO açıklamaları
    'Cam ve Cam Ürünleri': 'Cam ve cam ürünleri ihaleleri — düz cam, cam şişe, cam elyaf, temperli cam ve endüstriyel cam alımları.',
    'Seramik, Porselen ve Refrakter Malzemeler': 'Seramik ve refrakter malzeme ihaleleri — fayans, sıhhi tesisat, ateşe dayanıklı tuğla ve porselen alımları.',
    'Ahşap, Orman Ürünleri ve Mobilya': 'Ahşap ve mobilya ihaleleri — kereste, kontrplak, MDF, sunta, parke ve mobilya alımları.',
    'Kağıt, Karton ve Baskı Sanayi': 'Kağıt ve baskı sanayi ihaleleri — ofset kağıdı, kraft, karton, gazete kağıdı ve baskı malzemeleri.',
    'Tarım, Hayvancılık ve Tarımsal Teknolojiler': 'Tarım ve hayvancılık ihaleleri — tohum, gübre, tarım makineleri, sulama sistemleri ve yem alımları.',
    'Madencilik ve Mineral İşleme': 'Madencilik ve mineral işleme ihaleleri — mermer, granit, bor, krom, bakır ve maden ekipmanı alımları.',
    'Boya, Vernik ve Yüzey Kaplama Sistemleri': 'Boya ve yüzey kaplama ihaleleri — endüstriyel boya, epoksi, toz boya, vernik ve kaplama sistemleri.',
    'Petrol, Doğalgaz ve Petrokimya': 'Petrol ve doğalgaz ihaleleri — boru, vana, sondaj ekipmanı, LPG, rafine ürün ve petrokimya alımları.',
    'Savunma ve Havacılık Sanayi': 'Savunma ve havacılık sanayi ihaleleri — askeri ekipman, uçak parçaları, insansız hava aracı ve sistemleri.',
    'Denizcilik, Gemi ve Su Araçları': 'Denizcilik ve gemi sanayi ihaleleri — tekne, yat, deniz ekipmanları, liman ve tersane malzemeleri.',
    'İlaç, Eczacılık ve Biyoteknoloji': 'İlaç ve biyoteknoloji ihaleleri — API hammadde, ilaç makineleri, laboratuvar ürünleri ve sarf malzemeleri.',
    'Çevre Teknolojileri ve Atık Yönetimi': 'Çevre ve atık yönetimi ihaleleri — su arıtma, atık işleme, hava filtrasyonu ve geri dönüşüm ekipmanları.',
};

export const getSektorDescription = (sektorAdi) =>
    SEKTOR_DESCRIPTIONS[sektorAdi] || `${sektorAdi} sektöründeki açık ihaleler — Tedport tedarik portalında teklif verin.`;
