-- Enes Doğanay | 28 Haziran 2026: Bilgi Merkezi 4. paket — kategori yeniden yapılandırması + 10 yeni makale
-- Yeni kategoriler: Mevzuat, Sektör Rehberi
-- "Rehber" kategorisi kaldırılıp anlamlı kategorilere dağıtıldı
-- Toplam: 28 mevcut → 38 makale | 4 kategori → 5 kategori

-- ─────────────────────────────────────────────────────────────────
-- BÖLÜM 1: KATEGORİ YENİDEN YAPILANDIRMASI
-- ─────────────────────────────────────────────────────────────────

-- Mevzuat kategorisine taşı (hukuki/düzenleyici içerikler)
UPDATE blog_posts SET category = 'Mevzuat' WHERE slug IN (
  'kamu-ihalelerine-katilim-rehberi',
  'ihale-sonucuna-itiraz-sureci',
  'ihale-teminat-mektubu-rehberi'
);

-- Sektör Rehberi kategorisine taşı (sektöre özel rehberler)
UPDATE blog_posts SET category = 'Sektör Rehberi' WHERE slug IN (
  'insaat-sektorunde-ihale-yapirim-rehberi',
  'lojistik-nakliye-ihalesi-rehberi'
);

-- Rehber → Satınalma (tedarik sürecine odaklı olanlar)
UPDATE blog_posts SET category = 'Satınalma' WHERE slug IN (
  'tedarikci-degerlendirme-nasil-yapilir',
  'iso-tse-sertifika-tedarikci-kalite-belgesi'
);

-- Rehber → Dijital Dönüşüm (teknoloji/platform içerikleri)
UPDATE blog_posts SET category = 'Dijital Dönüşüm' WHERE slug IN (
  'e-fatura-e-arsiv-kobi-rehberi',
  'kobi-b2b-platform-secim-rehberi'
);

-- Rehber → İhale Rehberi (pratik ihale içerikleri)
UPDATE blog_posts SET category = 'İhale Rehberi' WHERE slug = 'ihale-icin-firma-profili-nasil-hazirlanir';

-- ─────────────────────────────────────────────────────────────────
-- BÖLÜM 2: YENİ MAKALELER — 10 ADET
-- Mevzuat (3) | Sektör Rehberi (4) | Dijital Dönüşüm (2) | Satınalma (1)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO blog_posts (slug, title, summary, content, category, reading_time, cover_color, published_at, seo_title, seo_description) VALUES

-- ─────────────────────────────────────────────────────────────────
-- 1. SGK ve Vergi Borcu | Mevzuat
-- ─────────────────────────────────────────────────────────────────
(
  'sgk-vergi-borcu-ihale-katilimi',
  'SGK ve Vergi Borcu İhaleye Katılımı Nasıl Etkiler?',
  'SGK prim borcu veya vergi borcu olan firmalar ihaleye girebilir mi? Hangi belgeler isteniyor, borç yapılandırması işe yarıyor mu? Tüm detaylar bu rehberde.',
  '<h2>İhale İçin "Temiz Belge" Zorunluluğu</h2>
<p>Türkiye''de kamu ihalelerine katılmak için 4734 sayılı Kamu İhale Kanunu''nun 10. maddesi çerçevesinde bir dizi yükümlülük yerine getirilmesi gerekir. Bu yükümlülüklerin en kritik ikisi; SGK''ya prim borcu bulunmaması ve vergi dairesine vergi borcu bulunmamasıdır. Özel sektör ihalelerinde de büyük alıcıların çoğu aynı koşulları sözleşme şartı olarak talep etmektedir.</p>
<p>Bu iki belgeyi temin edemeyen firmalar teklifleri değerlendirmeye alınmaz ve ihalenin dışında kalır. Peki borç varsa ne yapılabilir?</p>

<h2>SGK Prim Borcunun İhaleye Etkisi</h2>
<h3>Hangi Borçlar Engel Oluşturur?</h3>
<p>SGK''ya olan borcun <strong>vadesi geçmiş ve ödenmemiş</strong> olması engeldir. Taksitlendirilmiş veya yapılandırılmış borçlar, taksit ödemelerine devam edildiği sürece engel oluşturmaz. SGK prim borcu yokluğunu gösteren belge (e-Devlet veya SGK''dan alınan borcu yoktur belgesi), ihale tarihinden en fazla üç ay öncesine ait olmalıdır.</p>
<h3>Hangi Prim Türleri Kapsanır?</h3>
<ul>
  <li>İşveren payı ve işçi payı SGK primleri</li>
  <li>İşsizlik sigortası primleri</li>
  <li>İdari para cezaları (ödenmemiş kesinleşmiş)</li>
  <li>SGK''ya bağlı Bağ-Kur ve Emekli Sandığı borçları (varsa)</li>
</ul>
<h3>Çözüm: Yapılandırma</h3>
<p>SGK borcu yapılandırması için şubeye veya e-Devlet''ten başvuru yapılabilir. Yapılandırma onaylandıktan sonra taksitlerin düzenli ödenmesi koşuluyla "borcu yoktur" belgesi alınabilir. Dikkat: İlk taksitin ödenmeden önce SGK belgesi verilemez.</p>

<h2>Vergi Borcunun İhaleye Etkisi</h2>
<h3>Hangi Borçlar Engel Oluşturur?</h3>
<p>6183 sayılı Amme Alacaklarının Tahsil Usulü Hakkında Kanun kapsamında <strong>vadesi geçmiş ve kesinleşmiş</strong> vergi borçları ihaleden men sebebidir. Vergi itiraz süreçlerinde olan, dava aşamasındaki veya taksitlendirilmiş borçlar ihale dışı bırakma gerekçesi oluşturmaz.</p>
<h3>Hangi Borç Türleri Sayılır?</h3>
<ul>
  <li>KDV, gelir vergisi, kurumlar vergisi ve stopaj borçları</li>
  <li>Damga vergisi ve harç borçları</li>
  <li>Motorlu taşıtlar vergisi (firma araçlarına ait)</li>
  <li>ÖTV borçları</li>
</ul>
<h3>Çözüm: Yapılandırma veya Tecil</h3>
<p>Vergi dairesine başvurularak borç taksitlendirilebilir (Vergi Usul Kanunu Md. 48) veya tecil ve taksitlendirme yapılabilir. İkinci taksit ödendikten sonra "borcu yoktur" yazısı alınabilir. Ayrıca belirli yıllarda çıkan af/yapılandırma kanunlarını (7440, 7326 gibi) yakından takip edin.</p>

<h2>Özel Sektör İhalelerinde Durum</h2>
<p>Özel şirketlerin yönettiği B2B ihaleler yasal olarak aynı zorunluluğa tabi değildir; ancak kurumsal alıcıların büyük çoğunluğu tedarik şartnamelerine SGK ve vergi borcu olmama koşulunu eklemektedir. Tedport gibi platformlarda yer alan güvenilir alıcılar da genellikle bu belgeleri sözleşme aşamasında talep eder.</p>

<h2>Pratik Kontrol Listesi</h2>
<ul>
  <li>İhale tarihinden en az 2 hafta önce SGK ve vergi borcunuzu sorgulayın</li>
  <li>Borç varsa hemen yapılandırma başvurusu yapın</li>
  <li>Yapılandırma onayını ve ilk taksit makbuzunu dosyanıza ekleyin</li>
  <li>e-Devlet üzerinden "SGK Borcu Sorgulama" ve "Vergi Borcu Sorgulama" servislerini kullanın</li>
  <li>Belge geçerlilik sürelerine dikkat edin (genellikle 3 ay)</li>
</ul>

<h2>Sonuç</h2>
<p>SGK veya vergi borcu ihaleye katılımı engeller, ancak bu engel kalıcı değildir. Zamanında yapılandırma başvurusu ve düzenli takip ile sorun çözülebilir. İhale takvimini göz önünde bulundurarak bu işlemleri en az bir ay önceden tamamlamak, sürpriz engellerle karşılaşmamak için en sağlıklı yoldur.</p>',
  'Mevzuat',
  7,
  '#b45309',
  '2026-06-21 09:00:00+03',
  'SGK ve Vergi Borcu İhaleye Katılımı Nasıl Etkiler? | Tedport',
  'SGK prim borcu veya vergi borcu olan firmalar ihaleye girebilir mi? Yapılandırma seçenekleri ve pratik çözümler hakkında kapsamlı rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 2. İhalede Yasaklılık | Mevzuat
-- ─────────────────────────────────────────────────────────────────
(
  'ihalede-yasaklilik-sebep-kaldirilma',
  'İhalede Yasaklılık: Sebepler, Süresi ve Kaldırma Yolu',
  'Hangi eylemler ihale yasaklılığına yol açar? Yasaklılık süresi ne kadar? İhale yasaklılığı nasıl kaldırılır? 4734 sayılı Kanun çerçevesinde kapsamlı açıklama.',
  '<h2>İhale Yasaklılığı Nedir?</h2>
<p>İhale yasaklılığı; 4734 sayılı Kamu İhale Kanunu''nun 58. ve 59. maddeleri kapsamında belirli hukuka aykırı eylemleri nedeniyle idareler tarafından firmalar veya gerçek kişiler hakkında uygulanan, geçici veya süresiz ihalelere katılım yasağıdır. Yasaklı firmalar bu süre içinde hiçbir kamu ihalesine katılamaz; teklif vermeleri halinde teklifleri değerlendirmeye alınmaz.</p>

<h2>Hangi Eylemler Yasaklılığa Yol Açar?</h2>
<h3>1. Sahte Belge Kullanımı ve Yanıltma (Md. 58/1)</h3>
<p>İhale belgelerinde sahte bilgi veya belge sunmak, yanıltıcı beyan vermek en ağır yasaklılık sebebidir. Bu eylem 2-5 yıl arası yasaklılıkla sonuçlanabilir.</p>
<h3>2. Rekabeti Bozan Eylemler (Md. 58/1)</h3>
<p>Diğer isteklilerle fiyat koordinasyonu, danışıklı teklif (ihale muvazaası) ve rekabeti engelleyici her türlü anlaşma bu kapsama girer. Rekabet Kurumu bildiriminin ardından yasaklılık uygulanabilir.</p>
<h3>3. Sözleşme İhlalleri (Md. 58/2)</h3>
<p>Sözleşmeyi haklı neden olmaksızın süresinde bitirmemek, sözleşmeden tek taraflı kaçmak veya kesin teminatın idarece irat kaydedilmesine neden olmak 1-3 yıl yasaklılık doğurur.</p>
<h3>4. İş ve İşlemlerin Engellenmesi</h3>
<p>İhale yetkililerini, komisyon üyelerini etkilemeye ya da engellemeye teşebbüs etmek.</p>
<h3>5. Bilgi ve Belge Gizleme</h3>
<p>Yeterlik belgelerini gizlemek, ön yeterlik aşamasında bilgi saklamak.</p>

<h2>Yasaklılık Süresi</h2>
<p>Yasaklılık süresi ihlalin ağırlığına göre değişmektedir:</p>
<ul>
  <li><strong>1-2 yıl:</strong> Sözleşme ihlalleri, hafif usulsüzlükler</li>
  <li><strong>2-5 yıl:</strong> Sahte belge, yanıltma, rekabet ihlali</li>
  <li><strong>Süresiz:</strong> Terörün finansmanı veya ağır suç teşkil eden eylemler</li>
</ul>
<p>Yasaklılık, KİK Kamu İhale Bülteni''nde yayımlanır ve EKAP''a işlenir. Herhangi bir ihale idaresi EKAP sorgusunda yasaklılığı görür.</p>

<h2>Yasaklılık Nasıl Kaldırılır?</h2>
<h3>İdareye Şikayet</h3>
<p>Yasaklılık kararını tebellüğ eden firma, tebliğ tarihinden itibaren <strong>10 gün içinde</strong> ilgili idareye şikayette bulunabilir. İdare 30 gün içinde karar vermelidir.</p>
<h3>KİK''e İtirazen Şikayet</h3>
<p>İdareye şikayet reddedilirse veya süresi içinde yanıt verilmezse, şikayet tarihinden itibaren <strong>10 gün içinde</strong> Kamu İhale Kurumu''na (KİK) itirazen şikayet başvurusu yapılır. KİK 20 iş günü içinde karar verir.</p>
<h3>Danıştay Başvurusu</h3>
<p>KİK kararı da olumsuz olursa idare mahkemesi veya Danıştay''a iptal davası açılabilir. Yürütmeyi durdurma kararı alınırsa yasaklılık geçici olarak askıya alınır.</p>

<h2>Yasaklılık Kaydınız Var mı? Nasıl Kontrol Edersiniz?</h2>
<p>EKAP (ekap.gov.tr) üzerinden "Yasaklı Firma Sorgulama" menüsünden vergi numaranızla sorgulama yapabilirsiniz. Ayrıca ihaleye katılmadan önce bu kontrolü ihale şartnamesi teslimi sırasında da yapmanız önerilir.</p>

<h2>Özel Sektör İhalelerine Etkisi</h2>
<p>Kamu ihale yasağı doğrudan özel sektör ihalelerini kapsamaz; ancak kurumsal alıcılar EKAP''tan tedarikçilerini sorguladığında yasaklılığı görür. Bu durum güven kaybına ve sözleşme iptallere yol açabilir. Tedport gibi platformlarda profil güvenilirliği de bu tür kayıtlardan olumsuz etkilenebilir.</p>',
  'Mevzuat',
  8,
  '#b45309',
  '2026-06-22 09:00:00+03',
  'İhalede Yasaklılık: Sebepler, Süresi ve Kaldırma Yolu | Tedport',
  '4734 sayılı Kanun kapsamında ihale yasaklılığı sebepleri, süresi ve itiraz yolları hakkında kapsamlı hukuki rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 3. KİK Temel Maddeler | Mevzuat
-- ─────────────────────────────────────────────────────────────────
(
  'kik-ihale-kanunu-temel-maddeler',
  '4734 Sayılı Kamu İhale Kanunu: Temel Maddeler ve Güncel Eşik Değerler',
  'Kamu ihalelerine katılmak veya ihale yönetmek isteyenler için 4734 sayılı KİK''in en kritik maddeleri, ihale yöntemleri ve 2025 yılı eşik değerleri özeti.',
  '<h2>4734 Sayılı Kanun Neden Bu Kadar Önemli?</h2>
<p>4734 sayılı Kamu İhale Kanunu, Türkiye''deki devlet kurumları, belediyeler, üniversiteler ve kamu iktisadi teşebbüslerinin mal, hizmet ve yapım işi alımlarını düzenleyen temel kanundur. Kamu ihalelerine katılacak her tedarikçinin bu kanunun temel çerçevesini bilmesi zorunludur; çünkü ihalenin her aşaması bu kanunla belirlenmiş usul ve esaslara göre yürütülür.</p>

<h2>Kanunun Ana Başlıkları</h2>
<h3>Amaç ve Kapsam (Md. 1-3)</h3>
<p>Kanun; kamu kaynaklarının verimli kullanılması, saydamlık, rekabet, eşit muamele ve güvenilirlik ilkelerini gözetir. Kapsam dışı istisnalar (savunma, istihbarat, acil satın almalar gibi) ayrıca düzenlenmiştir.</p>
<h3>Temel Tanımlar (Md. 4)</h3>
<p>İhale, istekli, yeterlik, teklif, yaklaşık maliyet gibi temel kavramlar bu maddede tanımlanmıştır. Bunları bilmeden şartname okumak güçleşir.</p>
<h3>İhaleye Katılım Koşulları (Md. 10)</h3>
<p>İhaleye katılabilmek için;</p>
<ul>
  <li>İflas veya konkordato ilan edilmemiş olmak</li>
  <li>Hakkında İdare mahkemesi kararı bulunmamak</li>
  <li>Mesleki faaliyetten yasaklanmamış olmak</li>
  <li>Vergi ve SGK borcu bulunmamak</li>
  <li>İhale yetkilisi veya komisyon üyesiyle akraba olmamak</li>
</ul>
<h3>Eşik Değerler (Md. 13)</h3>
<p>Hangi ihale yönteminin kullanılacağı yaklaşık maliyetin eşik değere göre hesaplanmasıyla belirlenir. Eşik değerler Kamu İhale Kurumu tarafından yılda bir revize edilir.</p>

<h2>İhale Yöntemleri ve Ne Zaman Kullanılır</h2>
<h3>Açık İhale Usulü (Md. 19)</h3>
<p>En yaygın yöntemdir. Tüm isteklilere açık, ilan koşullarını taşıyan herkes katılabilir. Mal, hizmet ve yapım ihalelerinin büyük çoğunluğunda kullanılır.</p>
<h3>Belli İstekliler Arasında İhale (Md. 20)</h3>
<p>Ön yeterlik aşamasından geçen firmalar davet alır. Uzmanlık veya gizlilik gerektiren işlerde tercih edilir.</p>
<h3>Pazarlık Usulü (Md. 21)</h3>
<p>İstisnai durumlarda uygulanır: doğal afet, savaş hali, aciliyet, teknik nedenlerle tek firma, ihale yapılamama hali gibi. a, b, c, d, e, f alt bentleri farklı koşulları düzenler.</p>
<h3>Doğrudan Temin (Md. 22)</h3>
<p>Belirlenen limit dahilindeki küçük alımlar için ihale gerekmez. 2025 yılı için bu limit yaklaşık 2 milyon TL''dir (Kurum kararıyla güncellenir).</p>

<h2>2025 Yılı Güncel Eşik Değerleri</h2>
<p>Kamu İhale Kurumu, 2025 yılı için eşik değerleri aşağıdaki gibi belirlemiştir (KİK kararıyla değişebilir, güncel değerleri ekap.gov.tr''den teyit edin):</p>
<ul>
  <li><strong>Mal ve hizmet alımları — genel idare:</strong> 1.700.000 TL</li>
  <li><strong>Mal ve hizmet alımları — KİT''ler:</strong> 2.500.000 TL</li>
  <li><strong>Yapım işleri — genel idare:</strong> 20.000.000 TL</li>
  <li><strong>Yapım işleri — KİT''ler:</strong> 30.000.000 TL</li>
</ul>
<p>Yaklaşık maliyeti bu değerlerin altında kalan alımlar daha basitleştirilmiş usulde yapılabilir.</p>

<h2>Sözleşme Aşaması (Md. 42-57)</h2>
<p>Sözleşme; ihalenin üzerinde kaldığı istekliye tebliğ tarihinden itibaren 10 gün içinde imzalanmalıdır. Kesin teminat sözleşme bedelinin %6''sıdır. Fiyat farkı, süre uzatımı ve sözleşme devri maddeleri bu bölümde düzenlenmiştir.</p>

<h2>Şikayet ve İtiraz (Md. 54-57)</h2>
<p>İhale sürecinde hak ihlali gören istekli, ihale idaresine ve ardından KİK''e itiraz edebilir. KİK kararına karşı Danıştay yolu açıktır. Süre ve usul koşulları sıkıdır; bu nedenle ayrıntılı rehberimizi incelemenizi öneririz.</p>

<h2>Özel Sektörle Farkı</h2>
<p>Özel sektör ihaleleri 4734 sayılı Kanun''a tabi değildir; firmalar kendi iç prosedürlerini belirler. Ancak Tedport gibi B2B platformlarda yönetilen ihaleler de şeffaflık, rekabet ve belge gereklilikleri açısından benzer standartlara yaklaşmaktadır.</p>',
  'Mevzuat',
  9,
  '#b45309',
  '2026-06-23 09:00:00+03',
  '4734 Sayılı KİK Temel Maddeler ve Eşik Değerler 2025 | Tedport',
  'Kamu İhale Kanunu''nun temel maddeleri, ihale yöntemleri ve 2025 güncel eşik değerleri hakkında özet rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 4. IT ve Yazılım İhale | Sektör Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'it-yazilim-ihale-rehberi',
  'IT ve Yazılım İhalelerinde Başarılı Olmanın 7 Yolu',
  'Yazılım geliştirme, SaaS lisans alımı ve BT altyapı ihalelerinin kendine özgü kuralları var. Teknik şartname nasıl okunur, fiyat nasıl belirlenir, referans nasıl hazırlanır?',
  '<h2>IT İhalelerinin Diğer İhalelerden Farkı Nedir?</h2>
<p>Makine veya hammadde alımlarının aksine, BT ve yazılım ihalelerinde "ürün" çoğu zaman somut değildir. Hizmet kapsamı, entegrasyon gereklilikleri ve bakım koşulları teklifin merkezine oturur. Alıcı, teknik detayları yeterince bilmeden şartname yazamayabileceğinden belirsizlik sıkça yaşanır. Bu belirsizliği avantaja çevirmek, IT ihalelerinde başarının anahtarıdır.</p>

<h2>1. Teknik Şartnameyi Doğru Okuyun</h2>
<p>IT ihalelerinde şartnameler üç katmanlıdır:</p>
<ul>
  <li><strong>Fonksiyonel gereksinimler:</strong> Sistemin ne yapması gerektiği (kullanıcı yönetimi, raporlama, entegrasyon noktaları)</li>
  <li><strong>Teknik gereksinimler:</strong> Hangi altyapı, veritabanı, programlama dili veya platform</li>
  <li><strong>Hizmet seviyesi gereksinimleri (SLA):</strong> Sistem erişilebilirliği (%99,9 uptime gibi), destek yanıt süresi</li>
</ul>
<p>Eksik veya çelişkili maddeleri şartname sorularıyla netleştirin. İhale idaresi yasal olarak cevap vermek zorundadır.</p>

<h2>2. Açıklama Talebinde Bulunmaktan Çekinmeyin</h2>
<p>IT ihalelerinde soru-cevap süreci kritiktir. "Mevcut sistemle entegrasyon sağlanacak mı?", "Veri migrasyonu kapsama dahil mi?", "Bulut çözümü kabul edilir mi?" gibi sorular teklif fiyatınızı kökten değiştirebilir. Bu soruları sormadan teklif hazırlamak büyük risk taşır.</p>

<h2>3. Fiyatlandırmayı Doğru Yapılandırın</h2>
<p>IT ihalelerinde üç yaygın fiyat modeli kullanılır:</p>
<ul>
  <li><strong>Götürü bedel:</strong> Tüm kapsam için sabit fiyat. Kapsam net olmadığında risk yüksektir.</li>
  <li><strong>Birim fiyat:</strong> Kullanıcı başına, modül başına veya saat başına. Değişken kapsam için uygundur.</li>
  <li><strong>Hibrit:</strong> Temel kurulum götürü, ek modüller birim fiyat. En dengeli seçenek.</li>
</ul>
<p>Bakım ve destek bedelini ayrı bir kalem olarak belirtin. İlk yılın bakımını bedava sunup sonrasını yüksek tutmak alıcı için şeffaf değildir ve uzun vadede ilişkiyi zedeler.</p>

<h2>4. Referanslarınızı Sektörel Seçin</h2>
<p>IT ihalelerinde "benzer iş" kavramı çok önemlidir. Benzer büyüklükte ve sektörde kurumsal müşterilerinizin referans mektuplarını hazırlayın. Kamu kurumlarına verilen hizmetler, özel sektör referanslarından genellikle daha ağır basar.</p>

<h2>5. Teknik Ekibinizi Teklif Dosyasına Yansıtın</h2>
<p>Yazılım projelerinde ekip kalitesi, fiyatın önüne geçebilir. Proje yöneticisi, baş geliştirici ve teknik mimar özgeçmişlerini şartnamenin istediği formatta hazırlayın. Sertifikasyonlar (AWS, Azure, ISO 27001, PCI-DSS) güçlü bir avantaj sağlar.</p>

<h2>6. Veri Güvenliği ve Gizlilik Maddelerini Önceden Hazırlayın</h2>
<p>Kamu ihalelerinde ve büyük özel sektör ihalelerinde KVKK uyumu, ISO 27001 belgesi ve veri işleme politikası talep edilmektedir. Bu belgeleri güncel tutun; ihale öncesinde hazırlamaya çalışmak süreci uzatır.</p>

<h2>7. Sunum ve Demo''ya Hazır Olun</h2>
<p>Büyük IT ihalelerinde değerlendirme sürecine demo veya proof-of-concept (POC) aşaması eklenebilir. Teklif dosyanız ne kadar iyi olursa olsun, canlı demo sırasındaki performans kararı belirler. Demo ortamınızı önceden test edin, müşterinin kullanacağı veri senaryolarını simüle edin.</p>

<h2>Tedport''ta IT Tedarikçisi Olarak Öne Çıkın</h2>
<p>Tedport''taki firma profilinize teknoloji sertifikalarınızı, referans projelerinizi ve uzmanlık alanlarınızı ekleyin. IT altyapısı veya yazılım arayan firmalar arama sonuçlarında sertifikalı ve detaylı profilli tedarikçileri önce görür.</p>',
  'Sektör Rehberi',
  8,
  '#0891b2',
  '2026-06-24 09:00:00+03',
  'IT ve Yazılım İhalelerinde Başarılı Olmanın 7 Yolu | Tedport',
  'Yazılım geliştirme, SaaS ve BT altyapı ihalelerinde kazanma stratejileri. Teknik şartname, fiyatlama ve referans hazırlama rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 5. Gıda ve Tarım İhale | Sektör Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'gida-tarim-ihale-rehberi',
  'Gıda ve Tarım Sektöründe Tedarik ve İhale Rehberi',
  'Gıda ihalelerinde hijyen belgeleri, mevsimsel fiyatlama ve soğuk zincir gereklilikleri nasıl yönetilir? Tarım ve gıda tedarikçileri için kapsamlı rehber.',
  '<h2>Gıda Sektöründe İhale Neden Farklı?</h2>
<p>Gıda tedariki ihaleleri, üç önemli özelliğiyle diğer alımlardan ayrılır: raf ömrü sınırlılığı, mevsimsel fiyat dalgalanmaları ve zorunlu hijyen/sertifika gereklilikleri. Bu faktörleri doğru yönetemeyen firmalar ya ihale dışı kalır ya da kazandıkları halde zarar eder.</p>

<h2>Zorunlu Sertifikalar ve Belgeler</h2>
<h3>Üretici Firmalar İçin</h3>
<ul>
  <li><strong>Gıda İşletmesi Kayıt/Onay Belgesi:</strong> Tarım ve Orman Bakanlığı''ndan alınır; üretim tesisinin lisanslı olduğunu kanıtlar.</li>
  <li><strong>ISO 22000 veya FSSC 22000:</strong> Gıda güvenliği yönetim sistemi belgeleri, özellikle kurumsal alıcılar ve ihracat için zorunlu hale gelmiştir.</li>
  <li><strong>HACCP Belgesi:</strong> Tehlike analizi ve kritik kontrol noktaları sistemi. Büyük zincir market ve toplu tüketim ihaleleri için standart şart.</li>
  <li><strong>Helal/Kosher (varsa):</strong> Sektöre ve alıcıya göre talep edilebilir.</li>
</ul>
<h3>Toptancı ve Dağıtıcı Firmalar İçin</h3>
<ul>
  <li>Gıda nakil aracı ruhsatı (soğutmalı araç ise ATP belgesi)</li>
  <li>Depo kayıt belgesi (soğuk hava deposu varsa sıcaklık takip kayıtları)</li>
  <li>İşyeri açma ve çalışma ruhsatı</li>
</ul>

<h2>Mevsimsel Fiyatlama Stratejisi</h2>
<p>Gıda ihalelerinin en büyük riski, ihale tarihinde belirlenen fiyatın teslim döneminde geçersiz kalmasıdır. Özellikle taze meyve-sebze, süt ve et ürünleri gibi volatil kalemler için aşağıdaki stratejiler kullanılır:</p>
<ul>
  <li><strong>Spot fiyat bağlantısı:</strong> Teklife "hal taban fiyatı + %X kâr marjı" formülü dahil etmek. Alıcı kabul ederse her ay fatura güncellenir.</li>
  <li><strong>Kısa dönemli sözleşme:</strong> Uzun vadeli taahhüt yerine 3 aylık periyotlarla fiyat güncelleme hakkı.</li>
  <li><strong>Kategori ayrımı:</strong> Fiyatı sabit olanlar (bakliyat, kuru gıda) ile değişkenler (taze ürünler) ayrı kalemler olarak teklife yansıtılır.</li>
</ul>

<h2>Soğuk Zincir Yönetimi</h2>
<p>Donuk ve soğutulmuş ürün içeren ihaleler için soğuk zincir kırılmasına karşı garantiler sözleşmeye eklenmelidir:</p>
<ul>
  <li>Araç içi sürekli sıcaklık kaydı (datalogger)</li>
  <li>Teslim anında alıcı gözetiminde sıcaklık ölçümü</li>
  <li>Soğuk zincir ihlalinde iade ve yenileme prosedürü</li>
</ul>

<h2>Kamu Gıda İhaleleri: Toplu Tüketim</h2>
<p>Hastane, okul, askeriye ve cezaevi gibi toplu tüketim birimlerinin gıda ihaleleri yüksek hacimlidir. Bu ihaleler genellikle açık ihale usulüyle yürütülür ve kalemler çok fazla olabilir (200+ farklı ürün). Bu ihalelere girmek için:</p>
<ul>
  <li>Çok kategorili stok kapasitesi veya güçlü tedarikçi ağı gereklidir</li>
  <li>Teslimat güvenilirliği çok önemli; gecikme cezaları ağır olabilir</li>
  <li>Numune değerlendirme aşaması atlana bilir; önceden hazır olun</li>
</ul>

<h2>Özel Sektör Gıda İhaleleri</h2>
<p>Otel zincirleri, fabrika kantinleri, hava yolu şirketleri ve perakende zincirleri de düzenli gıda tedarik ihaleleri yapar. Bu ihalelerde fiyat kadar sürdürülebilir kaynak belgesi (organik, coğrafi işaret, Fair Trade) giderek daha fazla rol oynamaktadır.</p>

<h2>Tedport''ta Gıda Tedarikçisi Profili</h2>
<p>Profilinize ISO 22000, HACCP ve gıda işletmesi onay belgelerinizi yükleyin. Ürün kategorilerinizi ayrıntılı belirtin. Soğuk zincir kapasitesi, teslimat bölgeleri ve minimum sipariş miktarı gibi bilgiler alıcıların sizi daha hızlı değerlendirmesini sağlar.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-25 08:00:00+03',
  'Gıda ve Tarım Sektöründe Tedarik ve İhale Rehberi | Tedport',
  'Gıda ihalelerinde hijyen sertifikaları, mevsimsel fiyatlama ve soğuk zincir yönetimi. Gıda tedarikçileri için kapsamlı rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 6. Metal ve Makine İhale | Sektör Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'metal-makine-ihale-tedarikci-rehberi',
  'Metal ve Makine Sektöründe Tedarikçi Olmanın Yolları',
  'Türkiye''nin en büyük ihale hacmine sahip sektörlerinden biri. Metal imalat ve makine ihalelerinde teknik şartname, numune sunumu ve kalite belgeleri nasıl yönetilir?',
  '<h2>Metal ve Makine Sektörü Neden Öncelikli Hedef?</h2>
<p>Türkiye''deki B2B ihale hacminin önemli bir bölümü metal işleme, makine imalatı ve endüstriyel ekipman alımlarından oluşmaktadır. İnşaat, savunma, otomotiv yan sanayi, enerji ve altyapı projeleri; yılda onlarca milyar TL değerinde metal ve makine ihalesi açar. Bu sektörde rekabetçi kalmak için teknik yeterliliğin yanı sıra doğru teklif stratejisi belirleyicidir.</p>

<h2>Teknik Şartname Analizi</h2>
<h3>Malzeme Spesifikasyonları</h3>
<p>Metal ihalelerinde şartname çoğunlukla TS, EN veya ASTM standartlarına atıf yapar. Teklif vermeden önce:</p>
<ul>
  <li>İstenen alaşım kompozisyonunu (S235, S355, AISI 304 gibi) tespit edin</li>
  <li>Tolerans değerlerini ve yüzey işlem gerekliliklerini inceleyin</li>
  <li>Boyut ve ağırlık toleranslarına dikkat edin; fazla malzeme kullanımı marjınızı erider</li>
</ul>
<h3>Makine İhalelerinde Performans Kriterleri</h3>
<ul>
  <li>Güç, kapasite ve verimlilik değerleri (kW, ton/saat gibi)</li>
  <li>Garanti süresi ve yedek parça temin güvencesi</li>
  <li>CE işareti ve makina emniyeti yönetmeliği uyumu (zorunlu)</li>
  <li>Kurulum, devreye alma ve operatör eğitimi kapsamı</li>
</ul>

<h2>Numune ve Test Gereklilikleri</h2>
<p>Metal ve makine ihalelerinde çoğu zaman numune aşaması bulunur. Numune sunumunda dikkat edilecekler:</p>
<ul>
  <li>Numune maliyetini teklif fiyatına yansıtın (ihale kazanılmazsa bu maliyet karşılanmaz)</li>
  <li>Numune ile üretim kalitesinin aynı olmasına özen gösterin; fark tespit edilirse tüm iş iptal edilebilir</li>
  <li>Tahribatlı/tahribatsız muayene (RT, UT, MT) gerektiren ihalelerde akredite laboratuvar raporlarını hazır bulundurun</li>
</ul>

<h2>Kalite Belgeleri: Zorunlu ve Avantaj Sağlayanlar</h2>
<h3>Zorunlular</h3>
<ul>
  <li>ISO 9001 Kalite Yönetim Sistemi</li>
  <li>Malzeme test sertifikaları (3.1 veya 3.2 sertifika — EN 10204)</li>
  <li>CE işareti (makine emniyeti kapsamındaki ekipmanlar için)</li>
</ul>
<h3>Rekabet Avantajı Sağlayanlar</h3>
<ul>
  <li>ISO 14001 Çevre Yönetim Sistemi (yeşil tedarik eğilimi artıyor)</li>
  <li>IATF 16949 (otomotiv yan sanayi için)</li>
  <li>AS9100 (havacılık ve savunma için)</li>
  <li>TSE belgesi (yerli standart uyumu)</li>
</ul>

<h2>Fiyat Stratejisi</h2>
<p>Metal ihalelerinde hammadde fiyatı en büyük değişken olduğundan:</p>
<ul>
  <li>Uzun vadeli ihalelerde fiyat farkı (eskalasyon) maddesi talep edin</li>
  <li>LME (Londra Metal Borsası) veya ICDAS endeksine bağlı eskalasyon formülü önerebilirsiniz</li>
  <li>Kısa teslimat süreli ihalelerde spot fiyat alarak teklif verin</li>
  <li>Dövizli hammadde içeriyorsa dolar/euro kuru riskini ayrı bir kalemde belirtin</li>
</ul>

<h2>Lojistik ve Teslimat Planlaması</h2>
<p>Ağır ve hacimli metal ürünlerinin tesliminde özel taşıt gerekebilir. İhale şartnamesinde belirtilen teslim noktası, vinç veya forklift kapasitesi ve montaj yükümlülüğü teklif maliyetinizi etkiler. Lojistik maliyetini ihale fiyatının %5-10''u olarak planlamak genellikle gerçekçidir.</p>

<h2>Tedport''ta Metal/Makine Tedarikçisi Olarak Öne Çıkın</h2>
<p>Profilinize üretim kapasitesi (ton/ay), sahip olduğunuz makineler, sertifikalar ve işleme kabiliyetleri (CNC, lazer kesim, kaynak gibi) hakkında bilgi ekleyin. Referans proje fotoğrafları ve kapasitelerinizi gösteren belgeleri yüklemek, ihaleci firmaların sizi kısa liste yapmasını hızlandırır.</p>',
  'Sektör Rehberi',
  8,
  '#0891b2',
  '2026-06-25 10:00:00+03',
  'Metal ve Makine Sektöründe Tedarikçi Olmanın Yolları | Tedport',
  'Metal işleme ve makine imalat ihalelerinde teknik şartname analizi, numune yönetimi, kalite belgeleri ve fiyatlama stratejisi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 7. Temizlik ve Güvenlik Hizmet İhalesi | Sektör Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'temizlik-guvenlik-hizmet-ihalesi',
  'Temizlik ve Güvenlik Hizmet İhalelerinde Kazanma Stratejileri',
  'Türkiye''nin en yüksek hacimli hizmet ihalesi kategorileri arasında yer alan temizlik ve güvenlik ihalelerinde fiyatlama, personel yönetimi ve sözleşme tuzaklarından kaçınma rehberi.',
  '<h2>Neden Bu Sektör Özel?</h2>
<p>Temizlik ve özel güvenlik hizmet ihaleleri, Türkiye''deki ihale pazarının en büyük dilimlerinden birini oluşturur. Hastane, okul, banka, fabrika ve kamu binalarının kesintisiz hizmet alması nedeniyle bu ihaleler yılın her döneminde açılır. Ancak yoğun rekabet ve dar marjlar, bu sektörde sürdürülebilir büyümeyi zorlaştırır.</p>

<h2>Fiyatlama: Asgari Ücretin Altına Düşmeyin</h2>
<p>Temizlik ve güvenlik ihalelerinde en kritik risk; İş Kanunu, asgari ücret ve işçilik maliyetlerini yeterince yansıtmayan teklifler vermektir. İhaleyi kazanıp ardından zarara düşen firmalar hem mali hem de hukuki sorunlarla karşılaşır.</p>
<h3>Doğru Maliyetlendirme</h3>
<ul>
  <li>Brüt asgari ücret + işveren SGK payı (%20,5) + işsizlik fonu (%2)</li>
  <li>Yıllık izin, fazla mesai ve resmi tatil maliyetleri</li>
  <li>Giysi, ekipman ve sarf malzeme giderleri</li>
  <li>Ulaşım ve yemek yardımı (şartnamede varsa)</li>
  <li>Yönetim ve genel gider payı (%8-12 arası)</li>
  <li>Kâr marjı (temizlikte %5-10, güvenlikte %7-12 gerçekçi aralıktır)</li>
</ul>

<h2>Özel Güvenlik İhaleleri: Lisans ve Ek Gereklilikler</h2>
<p>Özel güvenlik hizmeti sunan firmalar için ekstra yasal gereklilikler mevcuttur:</p>
<ul>
  <li><strong>Özel Güvenlik Şirketi Faaliyet İzni:</strong> İçişleri Bakanlığı''ndan alınan zorunlu lisans</li>
  <li><strong>Güvenlik Görevlisi Kartı:</strong> Her personelin 5 yıllık yenilenen kimlik kartı</li>
  <li><strong>Silah Taşıma İzni:</strong> Silahlı güvenlik içeren ihaleler için ayrı onay</li>
  <li><strong>Güvenlik Soruşturması:</strong> Hassas binalarda (havalimanı, hastane, kamu binası) ek kontroller</li>
</ul>

<h2>Sözleşmede Dikkat Edilmesi Gereken Maddeler</h2>
<h3>Personel Sayısı ve Vardiya Düzeni</h3>
<p>Şartnameye yazan personel sayısının sabit mi yoksa "ihtiyaca göre" mi olduğunu netleştirin. Muğlak ifadeler alıcının ileride ek personel talep etmesine zemin hazırlar.</p>
<h3>İşçi Devir Tazminatı</h3>
<p>Sözleşme devri veya bitiminde önceki firmadan devralınan personelin kıdem tazminatı yükümlülüğü büyük bir risk kaynağıdır. Bu konuyu sözleşmede açıkça düzenleyin.</p>
<h3>Malzeme ve Ekipman</h3>
<p>Kim temin ediyor, kim bakımından sorumlu? Makine arızası iş durmasına neden olursa ceza var mı? Bu maddeler gözden kaçırılmamalıdır.</p>

<h2>Kalite Göstergelerini Öne Çıkarın</h2>
<p>Düşük fiyatla rekabet etmek yerine kalite farklılaşmasına odaklanın:</p>
<ul>
  <li>ISO 9001 (kalite yönetimi) ve ISO 14001 (çevre) sertifikaları</li>
  <li>OHSAS 18001 / ISO 45001 (iş sağlığı ve güvenliği)</li>
  <li>Referans müşteri listesi (benzer büyüklükte bina veya kurum)</li>
  <li>Denetim raporları ve müşteri memnuniyet anketleri</li>
</ul>

<h2>Uzun Vadeli Sözleşme Avantajı</h2>
<p>Birçok alıcı, yılda bir ihale yapmak yerine 2-3 yıllık çerçeve sözleşmeleri tercih eder. Bu sözleşmeler daha yüksek garanti karşılığında tedarikçiye fiyat istikrarı sağlar. Çerçeve sözleşme tekliflerini cazip kılmak için yıllık fiyat güncelleme endeksi (TÜFE veya asgari ücret artışı) maddesini mutlaka dahil edin.</p>

<h2>Tedport''ta Hizmet Tedarikçisi Profili</h2>
<p>Hizmet kapsamınızı (temizlik çeşitleri, güvenlik kategorileri), faaliyet gösterdiğiniz şehirleri ve referans müşteri sektörlerinizi profilinize ekleyin. Aktif lisanslarınızı belgeleyin. Alıcılar iletişime geçmeden önce sizi profilinizden değerlendirir.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-26 09:00:00+03',
  'Temizlik ve Güvenlik Hizmet İhalelerinde Kazanma Stratejileri | Tedport',
  'Temizlik ve özel güvenlik hizmet ihalelerinde fiyatlama, personel yönetimi, lisans gereklilikleri ve sözleşme tuzaklarından kaçınma rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 8. Tedport ile İhale Takibi | Dijital Dönüşüm
-- ─────────────────────────────────────────────────────────────────
(
  'tedport-ile-ihale-takibi-firma-profili',
  'Tedport''ta İhale Takibi ve Firma Profilinizi Güçlendirmenin 5 Yolu',
  'Tedport platformunu etkin kullanan firmalar daha fazla ihaleye ulaşır, daha hızlı teklif verir. Platform özelliklerini tam anlamıyla kullanmanın adım adım rehberi.',
  '<h2>Neden Platform Kullanımı Fark Yaratır?</h2>
<p>İhale bilgisine zamanında ulaşmak, ihaleye katılım kadar belirleyicidir. Fırsatı geç gören firma ya hazırlık süresini bulamaz ya da o ihalede olmaz. Tedport; Türkiye''nin kurumsal iş ağı olarak binlerce firmanın ve onlarca ihalenin bir arada bulunduğu ekosistemi sunar. Bu ekosistemi pasif bir vitrin olarak değil, aktif bir satış aracı olarak kullanmak büyük fark yaratır.</p>

<h2>1. Profilinizi Tam Doldurun</h2>
<p>Yarım bırakılan profiller arama sonuçlarında geride kalır. Alıcılar filtreleme yaparken sektör, il/ilçe ve ürün kategorisi gibi bilgilere bakarak karar verir. Profilinizde eksik olmaması gerekenler:</p>
<ul>
  <li><strong>Firma açıklaması:</strong> Ne üretiyorsunuz, hangi sektörlere hizmet veriyorsunuz, kaç yıllık deneyiminiz var?</li>
  <li><strong>Ürün/hizmet kategorileri:</strong> Ne kadar spesifik olursa o kadar doğru eşleşme</li>
  <li><strong>Sertifikalar:</strong> ISO, TSE, CE, HACCP — bunları yükleyin</li>
  <li><strong>Logo ve görsel:</strong> Logolu profiller %40 daha fazla tıklanır</li>
  <li><strong>İletişim bilgileri:</strong> Güncel telefon ve e-posta zorunlu</li>
</ul>

<h2>2. İhale Uyarılarını Kurun</h2>
<p>Platform üzerinden sektörünüze ve ürün kategorinize özel ihale bildirimlerini aktif edin. Yeni bir ihale açıldığında anında haberdar olursunuz. Erken bilgi = hazırlık için daha fazla süre = daha güçlü teklif.</p>

<h2>3. Teklif Verirken Mesajlaşma Aracını Kullanın</h2>
<p>Alıcıyla tüm iletişimi platform üzerinde yürütmek birçok avantaj sağlar:</p>
<ul>
  <li>Yazışma geçmişi kayıt altında kalır</li>
  <li>Ek dosya gönderimi kolay ve güvenli</li>
  <li>Alıcının taleplerine hızlı yanıt vererek güven inşa edersiniz</li>
</ul>

<h2>4. Referans ve Başarı Hikayelerinizi Paylaşın</h2>
<p>Profil sayfanıza tamamladığınız projeleri veya referans müşteri bilgilerini ekleyin. "Bu firmayı başkası da çalışıyor" güvencesi, yeni müşterinin karar sürecini kısaltır. Onaylı hesap rozeti gibi platform doğrulamalarını tamamlayarak güven skorunuzu artırın.</p>

<h2>5. Ekip Sayfanızı Aktif Tutun</h2>
<p>Firma ekibinin görünür olması şeffaflık mesajı verir. Satınalma sorumlularıyla doğrudan iletişim kurulabilmesi için ekip üyelerini platforma ekleyin ve görünürlük ayarlarını açık tutun. Kurumsal alıcılar kiminle çalıştıklarını bilmek ister.</p>

<h2>Sonuç: Platform = Pasif Vitrin Değil, Aktif Satış Kanalı</h2>
<p>Profilinizi tamamlayıp ardından günlerce giriş yapmayan firmaların elde ettiği ile her gün güncelleyen, tekliflere hızlı yanıt veren ve mesajları kaçırmayan firmaların elde ettiği arasında büyük uçurum var. Platform algoritması aktif firmaları öne çıkarır. Tedport''u düzenli kullanan firmalar daha kısa sürede daha fazla satış fırsatı yakalar.</p>',
  'Dijital Dönüşüm',
  6,
  '#dc2626',
  '2026-06-27 08:00:00+03',
  'Tedport''ta İhale Takibi ve Firma Profilinizi Güçlendirmenin 5 Yolu',
  'Tedport platformunu etkin kullanarak daha fazla ihaleye ulaşın. Profil optimizasyonu, ihale uyarıları ve teklif süreçleri için adım adım rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 9. 2026 B2B Trendleri | Dijital Dönüşüm
-- ─────────────────────────────────────────────────────────────────
(
  '2026-b2b-ihale-trendleri',
  '2026 Yılında B2B Tedarik Trendleri: Yapay Zeka, Platform ve Sürdürülebilirlik',
  'Yapay zeka destekli tedarik araçları, platform ekonomisinin yükselişi ve ESG baskısı — 2026''da kurumsal satınalmayı şekillendiren üç büyük trend ve bunlara nasıl hazırlanmalısınız.',
  '<h2>B2B Tedarik Hızla Dönüşüyor</h2>
<p>Pandemi sonrası normalleşme, jeopolitik gerilimler ve dijitalleşme baskısı kurumsal tedarik dünyasını kökten değiştirdi. 2026 yılına girerken alıcılar artık daha hızlı, daha şeffaf ve daha ölçülebilir tedarik süreçleri talep ediyor. Tedarikçi olmak isteyen firmalar için bu dönüşümü anlamak, önümüzdeki yıllarda rekabetçi kalmak anlamına geliyor.</p>

<h2>Trend 1: Yapay Zeka Destekli Tedarik Araçları</h2>
<h3>Fiyat Tahmini ve Piyasa Analizi</h3>
<p>Büyük alıcılar artık AI tabanlı araçlarla piyasa fiyatlarını anlık takip ediyor, tedarikçi tekliflerini otomatik analiz ediyor ve fiyat anomalilerini tespit ediyor. Bu gelişmenin tedarikçiler için anlamı: piyasa fiyatından büyük sapmalar artık çok daha hızlı fark ediliyor.</p>
<h3>Tedarikçi Risk Skorlaması</h3>
<p>AI, tedarikçilerin finansal sağlığını, teslimat geçmişini ve ülke/sektör riskini gerçek zamanlı analiz ediyor. İyi bir platform sicili ve şeffaf finansal yapı, AI risk puanlamasında avantaj sağlıyor.</p>
<h3>Otomatik Dokümantasyon</h3>
<p>Sözleşme oluşturma, teklif karşılaştırma ve onay süreçlerinin AI ile kısalması, tedarikçilerden de daha hızlı yanıt beklentisi doğuruyor. Dijital olmayan, e-posta tabanlı çalışan firmalar giderek daha fazla elenecek.</p>

<h2>Trend 2: Platform Ekonomisinin Yükselişi</h2>
<h3>Aracısız Alım Artıyor</h3>
<p>Tedport gibi dikey B2B platformlar, alıcı ile tedarikçiyi doğrudan buluşturarak geleneksel aracı katmanlarını ortadan kaldırıyor. Platform üzerinden gerçekleşen alımlar 2025''e göre %35 artış gösterdi. Platformda olmayan firmalar bu büyüyen pastadan pay alamıyor.</p>
<h3>Dijital Sertifikasyon</h3>
<p>Platform doğrulaması (onaylı hesap, kalite rozeti) fiziksel sertifika belgelerinin yerini almaya başlıyor. Alıcılar platform skoru yüksek tedarikçilere daha hızlı güveniyor.</p>
<h3>Veri Odaklı Tedarikçi Seçimi</h3>
<p>Geçmiş performans verisi, teslimat süreleri ve müşteri yorumları artık tedarikçi seçiminde belirleyici. Bu veriyi oluşturmak için platform kullanımına erken başlamak stratejik avantaj yaratıyor.</p>

<h2>Trend 3: ESG ve Sürdürülebilir Tedarik</h2>
<h3>Karbon Ayak İzi Raporlaması</h3>
<p>AB Tedarik Zinciri Yasası (CSDDD) ve Türkiye''nin yeşil mutabakat uyum süreci kapsamında büyük alıcılar tedarikçilerinden karbon emisyon verisi talep etmeye başlıyor. 2026-2027 döneminde bu talep Türk tedarikçiler için de somutlaşacak.</p>
<h3>Yeşil Sertifika Avantajı</h3>
<p>ISO 14001, karbon nötr sertifikası veya yenilenebilir enerji kullanımını belgeleyen firmalar büyük kurumsal alıcıların tedarikçi listelerinde öncelik kazanıyor. Üretim sürecindeki çevresel iyileştirmeler artık pazarlama avantajı, yakında ise zorunluluk olacak.</p>
<h3>Sosyal Yükümlülükler</h3>
<p>İnsan hakları ihlali, kayıt dışı istihdam veya çocuk işçiliğine dair şüphe taşıyan tedarikçiler kurumsal listelerden hızla çıkarılıyor. Kayıtlı istihdam, iş güvenliği belgeleri ve sosyal denetim raporları önemi artıyor.</p>

<h2>Tedarikçiler Ne Yapmalı?</h2>
<ul>
  <li>Dijital altyapıya yatırım yapın: e-imza, e-fatura, dijital teklif sistemi</li>
  <li>B2B platformlarda profilinizi aktif tutun ve veri oluşturun</li>
  <li>En az bir çevresel sertifika sürecini başlatın (ISO 14001 ideal başlangıç)</li>
  <li>AI araçlarını günlük süreçlere entegre edin (fiyat takibi, piyasa analizi)</li>
  <li>Finansal şeffaflığı artırın; denetlenmiş bilanço büyük alıcılara güven verir</li>
</ul>',
  'Dijital Dönüşüm',
  7,
  '#dc2626',
  '2026-06-27 10:00:00+03',
  '2026 B2B Tedarik Trendleri: Yapay Zeka, Platform ve Sürdürülebilirlik | Tedport',
  '2026 yılında kurumsal satınalmayı şekillendiren yapay zeka, platform ekonomisi ve ESG trendleri. Tedarikçiler için hazırlık rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 10. KOBİ İlk İhale | Satınalma
-- ─────────────────────────────────────────────────────────────────
(
  'kobi-ilk-ihale-baslangic-rehberi',
  'KOBİ''ler İçin İlk İhale Rehberi: Sıfırdan Nasıl Başlarsınız?',
  'Küçük ve orta ölçekli işletmeler için ihale dünyasına giriş: hangi ihaleler başlangıç için uygundur, hangi belgeler hazırlanmalı, ilk ihaleden ne öğrenilir?',
  '<h2>KOBİ Olarak İhaleye Girebilir miyim?</h2>
<p>Cevap kesin bir evet. Büyük firmaların tekelinde gibi görünen ihale pazarı, aslında KOBİ''ler için de büyük fırsatlar sunar. 4734 sayılı Kanun kapsamındaki kamu ihalelerinin önemli bir bölümü küçük ve orta ölçekli işletmelerin rahatlıkla karşılayabileceği büyüklüktedir. Özel sektör B2B ihalelerinde ise esneklik çok daha fazladır.</p>
<p>Sorun bilgi eksikliği ve "büyük firmalar kazanır" yanılgısıdır. Doğru stratejiyle KOBİ''ler hem kamu hem özel sektör ihalelerinde başarıyla yer alabilir.</p>

<h2>Hangi İhaleler Başlangıç İçin Daha Uygun?</h2>
<h3>Küçük Alım İhaleleri (Doğrudan Temin)</h3>
<p>Yaklaşık maliyeti düşük (2025 için yaklaşık 2 milyon TL altı) alımlar için idareler ihale açmak zorunda değildir. Bu alımlar bir veya birkaç firma davet edilerek yapılır. Bölgenizdeki kurumlara kendinizi tanıtmak, bu daveti almanın en etkili yoludur.</p>
<h3>Sektöre Özgü Küçük İhaleler</h3>
<p>Belediye, okul ve sağlık ocağı gibi küçük kamu birimlerinin açtığı ihaleler genellikle büyük firmaların ilgisini çekmez. Bu boşluk KOBİ''ler için değerli bir giriş noktasıdır.</p>
<h3>Alt Yüklenici Modeli</h3>
<p>İlk aşamada büyük ihaleleri doğrudan kazanmak yerine kazanan firmaya alt yüklenici olarak girin. Hem referans kazanırsınız hem de ihale sistemi nasıl çalışır bizzat öğrenirsiniz.</p>

<h2>Başlamadan Önce Hazırlık Listesi</h2>
<ul>
  <li>EKAP''a firma kaydı yaptırın (kamu ihaleleri için zorunlu)</li>
  <li>Ticaret odası kaydınızı ve güncel belgeleri hazırlayın</li>
  <li>SGK ve vergi borcunuzu sorgulayın; varsa yapılandırın</li>
  <li>Mali müşavirinizden geçen yıla ait bilanço ve gelir tablosunu isteyin</li>
  <li>Varsa sertifika ve kalite belgelerinizi dijital ortama aktarın</li>
  <li>Benzer iş belgesi veya referans mektubu hazırlayın</li>
</ul>

<h2>İlk Teklif: Beklentileri Gerçekçi Tutun</h2>
<p>İlk ihale denemelerinde kazanmak her zaman mümkün değildir; bu tamamen normaldir. İlk ihalein amacı şunlar olmalıdır:</p>
<ul>
  <li>Belge hazırlık sürecini öğrenmek</li>
  <li>Rekabetçi fiyat seviyelerini görmek (sonuçlar EKAP''ta yayımlanır)</li>
  <li>Komisyon değerlendirme sürecini anlamak</li>
  <li>Eksik noktaları tespit edip bir sonraki ihalede gidermek</li>
</ul>

<h2>KOBİ''lere Özel Destekler</h2>
<ul>
  <li><strong>KOSGEB Destekleri:</strong> İhale belgesi hazırlama, sertifikasyon ve danışmanlık maliyetlerinde KOSGEB hibe ve kredi destekleri mevcuttur</li>
  <li><strong>Ticaret Odası Danışmanlığı:</strong> Birçok oda ücretsiz ihale bilgilendirme hizmeti sunar</li>
  <li><strong>Konsorsiyum:</strong> Tek başına yeterli kapasiteye sahip olmayan KOBİ''ler ortaklaşarak büyük ihalelere girebilir</li>
</ul>

<h2>Tedport''la Özel Sektör İhalelerine Girin</h2>
<p>Kamu ihalesi bürokratik süreçleri zorlayıcı buluyorsanız, Tedport''ta yer alan özel sektör B2B ihaleleri daha esnek bir başlangıç noktası sunar. Profilinizi oluşturun, sektörünüzdeki ihalelere başvurun ve doğrudan alıcıyla iletişim kurun. Referans biriktirdikçe kamu ihalelerine geçiş çok daha kolay hale gelir.</p>

<h2>Sonuç: Başlamak Beklemekten İyidir</h2>
<p>İhale ekosistemi deneyimle öğrenilir. Her başvuru, kazanılsın ya da kazanılmasın, bir sonraki için değerli veri üretir. Belge arşivinizi kurun, fiyatlandırmanızı sistematik hale getirin ve her ihaleden öğrenin. KOBİ olmanın dezavantajları olduğu kadar avantajları da vardır: hız, esneklik ve kişisel ilgi büyük firmaların veremeyeceği değer katar.</p>',
  'Satınalma',
  8,
  '#059669',
  '2026-06-28 09:00:00+03',
  'KOBİ''ler İçin İlk İhale Rehberi: Sıfırdan Nasıl Başlarsınız? | Tedport',
  'Küçük ve orta ölçekli işletmeler için ihale dünyasına giriş rehberi. Hangi ihaleler uygun, belgeler nasıl hazırlanır, alt yüklenici modeli nasıl çalışır?'
);
