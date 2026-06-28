-- Enes Doğanay | 28 Haziran 2026: Sektör Rehberi genişletme — 8 yeni sektöre özel makale
-- Sektörler: Elektrik, Tekstil, Sağlık/Medikal, Kimya, Enerji, Otomotiv Yan Sanayi, Ambalaj, Çevre/Atık
-- Toplam Sektör Rehberi: 6 → 14 makale

INSERT INTO blog_posts (slug, title, summary, content, category, reading_time, cover_color, published_at, seo_title, seo_description) VALUES

-- ─────────────────────────────────────────────────────────────────
-- 1. Elektrik ve Elektrik Ekipmanları
-- ─────────────────────────────────────────────────────────────────
(
  'elektrik-ekipmanlari-ihale-tedarikci-rehberi',
  'Elektrik ve Elektrik Ekipmanları İhalelerinde Tedarikçi Rehberi',
  'Kablo, pano, aydınlatma ve enerji dağıtım ekipmanları ihalelerinde zorunlu belgeler, CE/TSE gereklilikleri ve fiyatlama stratejileri hakkında kapsamlı rehber.',
  '<h2>Neden Bu Sektör Her Zaman Talep Görür?</h2>
<p>Elektrik ve elektrik ekipmanları alımları; inşaat projeleri, fabrika yatırımları, kamu bina yenilemeleri ve altyapı çalışmalarıyla doğrudan bağlantılıdır. Türkiye''nin kentsel dönüşüm ve enerji altyapısı yatırımları bu sektördeki ihale hacmini sürekli canlı tutmaktadır. Kablo, trafo, pano, aydınlatma armatürü, şalt malzemeleri ve enerji ölçüm cihazları en sık alınan ürün kategorileridir.</p>

<h2>Zorunlu Belge ve Sertifikalar</h2>
<h3>CE İşareti (Zorunlu)</h3>
<p>AB Alçak Gerilim Yönergesi (LVD) ve EMC Yönergesi kapsamındaki tüm elektrik ekipmanları CE işareti taşımak zorundadır. Bu işaret olmadan ürün Türkiye pazarında satılamaz ve kamu ihalelerinde değerlendirmeye alınmaz.</p>
<h3>TSE Belgesi</h3>
<p>Kablo, sigorta, şalt malzemeleri ve sayaçlar için TSE standardı (TS EN serisi) belgesi çoğu kamu ihalesinde zorunlu tutulmaktadır. TSE belgeli ürün daha az sorgulanır ve değerlendirmede avantaj sağlar.</p>
<h3>Teknik Onay Belgeleri</h3>
<ul>
  <li>TEDAŞ veya EPDK teknik onayı (enerji dağıtım ekipmanları için)</li>
  <li>Akredite laboratuvar test raporları (kısa devre dayanımı, ısınma testi gibi)</li>
  <li>UL, IEC veya IEEE uyumluluk belgesi (ihracat veya uluslararası projeler için)</li>
</ul>

<h2>Teknik Şartname Analizi</h2>
<p>Elektrik ekipmanı ihalelerinde şartnamenin teknik kısmı çok detaylıdır. Dikkat edilmesi gereken başlıklar:</p>
<ul>
  <li><strong>Gerilim sınıfı:</strong> AG (alçak gerilim, 1 kV altı), OG (orta gerilim, 1-36 kV) veya YG (yüksek gerilim)</li>
  <li><strong>Koruma sınıfı:</strong> IP65, IP66 gibi değerler dış mekan kullanım için kritik</li>
  <li><strong>Kablo kesiti ve malzeme:</strong> Cu (bakır) veya Al (alüminyum); YVV, N2XH, XLPE kılıf tipi</li>
  <li><strong>Pano tipi:</strong> Endüstriyel, meskun alan, açık/kapalı tablo olması</li>
</ul>
<p>Şartname marka belirtiyorsa "veya muadili" ifadesine dikkat edin. Muadil önermeniz halinde teknik eşdeğerliği kanıtlayan belgeleri hazırlayın.</p>

<h2>Fiyatlama Stratejisi</h2>
<p>Bakır ve alüminyum fiyatları hammadde maliyetinin %60-70''ini oluşturur. LME spot fiyatlarına bağlı volatilite ciddi risk yaratır. Uzun vadeli ihalelerde:</p>
<ul>
  <li>LME bakır endeksine bağlı eskalasyon maddesi isteyin</li>
  <li>Fiyat teklifini "ihale tarihindeki LME + sabit işçilik/genel gider" formülle yapılandırın</li>
  <li>Teklif geçerlilik süresini 30 gün ile sınırlı tutun</li>
</ul>

<h2>Stok ve Teslimat Avantajı</h2>
<p>Pek çok elektrik ekipmanı ihalesinde hızlı teslimat belirleyicidir. Kablo uzunluğu, pano bileşen stoku ve trafo teslimat süreleri teklif öncesi netleştirilmelidir. "30 iş gününde teslim" taahhüdü yerine "ihale onayından itibaren X takvim günü" yazın; bu daha ölçülebilir ve gerçekçidir.</p>

<h2>Tedport''ta Elektrik Tedarikçisi Profili</h2>
<p>Ürün kategorilerinizi (kablo, pano, aydınlatma, şalt malzemeleri) ve marka yetkilerinizi profilinize ekleyin. CE ve TSE belgelerinizi yükleyin. Hangi gerilim sınıfında çalıştığınızı, hangi markaların distribütörü olduğunuzu belirtin. Coğrafi kapsama alanınızı (hangi iller servis ve teslimat sağlıyorsunuz) mutlaka yazın.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-28 08:00:00+03',
  'Elektrik ve Elektrik Ekipmanları İhalelerinde Tedarikçi Rehberi | Tedport',
  'Kablo, pano ve elektrik ekipmanı ihalelerinde CE/TSE gereklilikleri, bakır fiyat riski yönetimi ve rekabetçi teklif stratejileri.'
),

-- ─────────────────────────────────────────────────────────────────
-- 2. Tekstil ve Konfeksiyon
-- ─────────────────────────────────────────────────────────────────
(
  'tekstil-ihale-tedarikci-rehberi',
  'Tekstil Sektöründe İhale ve Tedarik: Kumaştan İş Kıyafetine Rehber',
  'İş kıyafeti, kurumsal tekstil ve teknik kumaş ihalelerinde standartlar, numune süreci ve mevsimsel fiyatlama stratejisi. Tekstil tedarikçileri için kapsamlı rehber.',
  '<h2>Tekstil İhalelerinin Kapsamı</h2>
<p>Türkiye''deki tekstil ihaleleri çok geniş bir yelpazede yer alır: fabrika iş elbisesi, güvenlik yeleği ve baret, hastane personel kıyafeti, okul forması, otel nevresim ve havlu, askeri tekstil, teknik filtreler ve endüstriyel dokumalar. Her kategorinin kendine özgü standartları, numune koşulları ve fiyatlandırma dinamikleri vardır.</p>

<h2>En Yüksek Hacimli Kategoriler</h2>
<h3>İş Kıyafeti ve Koruyucu Giysi İhaleleri</h3>
<p>Fabrikalar, belediyeler ve kamu kurumları her yıl personel iş kıyafeti satın alır. Bu ihalelerde:</p>
<ul>
  <li><strong>EN 340:</strong> Koruyucu giysi genel gereklilikleri</li>
  <li><strong>EN ISO 11611:</strong> Kaynak elbisesi standardı</li>
  <li><strong>EN 471 / EN ISO 20471:</strong> Yüksek görünürlüklü uyarıcı giysi</li>
  <li><strong>EN 13034:</strong> Sıvı kimyasallara karşı koruyucu giysi</li>
</ul>
<p>İSG gerektiren ortamlar için doğru EN standardını belirlemek ve bunu teklifte kanıtlamak rekabetçi avantaj sağlar.</p>
<h3>Kurumsal Tekstil (Otel, Hastane, Okul)</h3>
<p>Toplu alımlar olduğundan fiyat hassasiyeti çok yüksektir. Numune kalitesi ile üretim kalitesinin aynı olması zorunludur; fark tespit edilirken tüm parti iade edilebilir.</p>
<h3>Teknik Tekstil</h3>
<p>Filtre bezleri, jeotekstiller, ısı yalıtım tekstilleri ve endüstriyel bantlar. Bu kategoride teknik belge ve test raporları fiyattan daha belirleyicidir.</p>

<h2>Numune Süreci: En Kritik Aşama</h2>
<p>Tekstil ihalelerinin neredeyse tamamında numune değerlendirmesi yapılır. Başarısız numune, ihale dışı kalma anlamına gelir. Numune öncesi kontrol listesi:</p>
<ul>
  <li>İstenen gramaj, iplik sayısı ve dokuma tipini üretim departmanıyla teyit edin</li>
  <li>Renk sabiti testi (EN ISO 105 serisi) için akredite laboratuvar raporu hazırlayın</li>
  <li>Boyut değişim oranı (çekme) testini yıkama koşullarına uygun yaptırın</li>
  <li>Numune ile birlikte teknik ürün bilgi formasını (fabric data sheet) sunun</li>
</ul>

<h2>Mevsimsel Fiyatlama ve Hammadde Riski</h2>
<p>Pamuk, polyester ve viskon fiyatları yıl içinde önemli ölçüde değişir. Uzun vadeli veya büyük hacimli ihalelerde:</p>
<ul>
  <li>Hammadde bazlı fiyat güncelleme maddesi talep edin (pamuk endeksi referans alınabilir)</li>
  <li>Teklif geçerlilik süresini 45 güne kadar sınırlayın</li>
  <li>Stoğa sahipseniz bunu açıkça belirtin; hızlı teslimat güçlü bir rekabet aracıdır</li>
</ul>

<h2>Sürdürülebilirlik: Giderek Zorunlu Hale Geliyor</h2>
<p>Kurumsal alıcılar artık OEKO-TEX Standard 100 belgesi, GRS (Global Recycled Standard) veya GOTS (Global Organic Textile Standard) gibi sertifikalar talep etmektedir. Bu belgelere sahip olmak büyük alıcıların tedarikçi listelerine girmeyi kolaylaştırır.</p>

<h2>Tedport''ta Tekstil Tedarikçisi Profili</h2>
<p>Üretim kapasitesi (aylık kg veya adet), ürün kategorileri (iş kıyafeti, kumaş, teknik tekstil), minimum sipariş miktarı ve üretim süresi gibi bilgileri profilinize ekleyin. Numune gönderimi yapıp yapmadığınızı ve hangi bölgelere teslimat sağladığınızı belirtin.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-28 08:30:00+03',
  'Tekstil Sektöründe İhale ve Tedarik Rehberi | Tedport',
  'İş kıyafeti, kurumsal tekstil ve teknik kumaş ihalelerinde EN standartları, numune süreci ve mevsimsel fiyatlama stratejileri.'
),

-- ─────────────────────────────────────────────────────────────────
-- 3. Medikal ve Sağlık Teknolojileri
-- ─────────────────────────────────────────────────────────────────
(
  'medikal-saglik-ihale-rehberi',
  'Sağlık ve Medikal Sektöründe Tedarik: Hastane İhale Rehberi',
  'Medikal cihaz, sarf malzeme ve hastane ekipmanı ihalelerinde CE/TÜBİTAK onayı, klinik referans ve sağlık bakanlığı kaydı gereklilikleri hakkında kapsamlı rehber.',
  '<h2>Sağlık İhaleleri Neden Ayrı Bir Uzmanlık Gerektirir?</h2>
<p>Türkiye''de sağlık alımları; kamu hastaneleri (Sağlık Bakanlığı''na bağlı), üniversite hastaneleri, SSK/SGK hastaneleri ve özel hastane zincirleri aracılığıyla gerçekleştirilir. Bu ihaleler yüksek değerli, teknik açıdan karmaşık ve çok katmanlı düzenleyici gerekliliklere tabidir. Medikal cihazdan sarf malzemeye, ilaç muhafaza ekipmanından hastane mobilyasına kadar geniş bir yelpazeyi kapsar.</p>

<h2>Zorunlu Kayıt ve Onay Belgeler</h2>
<h3>TİTCK (Türkiye İlaç ve Tıbbi Cihaz Kurumu) Kaydı</h3>
<p>Türkiye''de satışa sunulan her tıbbi cihazın TİTCK''ya kayıtlı olması zorunludur. Kayıt olmadan kamu hastane ihalelerine teklif verilmez. Kayıt süreci cihaz sınıfına göre değişir:</p>
<ul>
  <li><strong>Sınıf I:</strong> Düşük riskli cihazlar (bandaj, terlik gibi) — bildirim yeterli</li>
  <li><strong>Sınıf IIa/IIb:</strong> Orta riskli (tanı cihazları, cerrahi malzeme) — onaylanmış kuruluş belgesi</li>
  <li><strong>Sınıf III:</strong> Yüksek riskli (kalp kapakçığı, stent) — tam dossier değerlendirmesi</li>
</ul>
<h3>CE İşareti (MDR/IVDR Uyumu)</h3>
<p>AB Tıbbi Cihazlar Yönetmeliği (MDR 2017/745) kapsamında CE belgesi artık zorunludur. ESKİ MDD belgeleri geçerliliğini yitirdi. Güncel MDR kapsamında yenilenmemiş CE belgesi ihalelerde kabul edilmez.</p>
<h3>İthalatçı/Yetkili Temsilci Belgesi</h3>
<p>Yabancı markalı ürünleri satan firmalar için TİTCK''ya kayıtlı Türkiye yetkili temsilcisi belgesi gereklidir.</p>

<h2>Klinik Referans Zorunluluğu</h2>
<p>Büyük medikal cihaz ihalelerinde ihale komisyonu benzer ürünü kullanan hastane referansı ister. Bu referanslar:</p>
<ul>
  <li>Kullanımda olan cihazın aynı modeli veya en yakın muadili kapsamalı</li>
  <li>Referans hastane yetkilisinin imzalı mektubunu içermeli</li>
  <li>İdeal olarak üniversite hastanesi veya eğitim araştırma hastanesi referansı olmalı</li>
</ul>

<h2>Fiyatlama ve Maliyet Yapısı</h2>
<p>Medikal ihalelerde en düşük fiyat her zaman kazanmaz. Değerlendirme kriterleri genellikle teknik puan (%60) + fiyat (%40) şeklinde ağırlıklandırılır. Teknik belgeler, klinik etkinlik verileri ve bakım/servis ağı fiyattan daha belirleyici olabilir.</p>
<ul>
  <li>Sarf malzeme ihalelerinde yerli üretim avantajı değerlendirmede artı puan sağlar</li>
  <li>Cihaz ihalelerinde kurulum, eğitim ve ilk yıl bakım paketini teklif kapsamına dahil edin</li>
  <li>Garanti süresi ve yedek parça temin taahhüdü kararı etkileyen kritik faktörlerdir</li>
</ul>

<h2>Özel Hastane İhaleleri</h2>
<p>Kamu ihale mevzuatına tabi olmayan özel hastaneler daha esnek ve hızlı tedarik süreçleri yürütür. Merkezi satınalma birimleri yıllık çerçeve anlaşmalarla tedarikçi bağlar. Bu pazara girmek için:</p>
<ul>
  <li>Hastane satınalma yöneticileriyle doğrudan iletişim kurun</li>
  <li>Tedport üzerinden teklif taleplerine hızlı yanıt verin</li>
  <li>Konsinyasyon modeli (kullanıldıkça fatura) bazı sarf malzemelerde kabul görmektedir</li>
</ul>

<h2>Tedport''ta Medikal Tedarikçi Profili</h2>
<p>TİTCK kayıt numaralarınızı, CE belgelerinizi ve ürün kategorilerinizi profilinize ekleyin. Yetkili distribütörü olduğunuz markaları belirtin. Hangi hastane türlerine (kamu, üniversite, özel) hizmet verdiğinizi yazın. Servis/bakım kapasitesi ve coğrafi hizmet bölgesi önemli diferansiyellerdir.</p>',
  'Sektör Rehberi',
  8,
  '#0891b2',
  '2026-06-28 09:00:00+03',
  'Sağlık ve Medikal Sektöründe Tedarik ve Hastane İhale Rehberi | Tedport',
  'Medikal cihaz ve sarf malzeme ihalelerinde TİTCK kaydı, CE uyumu, klinik referans ve fiyatlama stratejileri hakkında kapsamlı rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 4. Kimya ve Endüstriyel Kimyasallar
-- ─────────────────────────────────────────────────────────────────
(
  'kimya-endustriyel-kimyasal-ihale-rehberi',
  'Kimya ve Endüstriyel Kimyasal Tedarikinde İhale Rehberi',
  'Endüstriyel kimyasal alımlarında REACH/GHS uyumu, güvenlik veri sayfaları, depolama koşulları ve tehlikeli madde taşıma gereklilikleri. Kimya tedarikçileri için rehber.',
  '<h2>Kimya Sektöründe Tedarik Neden Farklı?</h2>
<p>Endüstriyel kimyasal alımları; temizlik kimyasalları, boya/vernik hammaddeleri, proses kimyasalları, su arıtma kimyasalları, yapıştırıcılar ve özel endüstriyel çözücülerden oluşur. Bu sektörde ürünün teknik özellikleri kadar güvenlik, mevzuat uyumu ve doğru depolama/taşıma koşulları da belirleyicidir. Mevzuat bilgisi olmayan firmalar hem ihale dışı kalır hem de ciddi hukuki risklerle karşılaşır.</p>

<h2>Zorunlu Belgeler ve Mevzuat Uyumu</h2>
<h3>GBF (Güvenlik Bilgi Formu / SDS)</h3>
<p>Her kimyasal ürün için REACH Yönetmeliği uyumlu, Türkçe Güvenlik Bilgi Formu (GBF/SDS) zorunludur. Bu form 16 bölümden oluşur ve ihale değerlendirmesinde standart bir belge olarak istenir. Güncel olmayan veya eksik GBF teklifi geçersiz kılabilir.</p>
<h3>REACH ve CLP Uyumu</h3>
<p>AB REACH Yönetmeliği''ne uyum, Türkiye''nin AB ile entegrasyon sürecinde giderek daha fazla kamu ihalesinde şart olarak yer almaktadır. CLP Yönetmeliği kapsamında doğru sınıflandırma, etiketleme ve ambalajlama zorunludur.</p>
<h3>Çevre ve Sağlık İzinleri</h3>
<ul>
  <li>Çevre ve Şehircilik Bakanlığı Tehlikeli Madde Depolama İzni</li>
  <li>ADR belgesi (tehlikeli kimyasal taşıma için şoför ve araç belgeleri)</li>
  <li>İşyeri açma ruhsatı (kimyasal depo/dolum tesisi için)</li>
</ul>

<h2>Ürün Stabilitesi ve Raf Ömrü Yönetimi</h2>
<p>Kimyasal ihalelerde raf ömrü kritik bir parametredir. Teklif verirken:</p>
<ul>
  <li>Teslim tarihi ile minimum raf ömrü arasındaki farkı hesaplayın (örn: "teslim tarihinde en az 18 ay raf ömrü" şartı)</li>
  <li>Depolama koşullarını (sıcaklık, nem, ışık) şartnameyle eşleştirin</li>
  <li>Büyük hacimli alımlarda kısmi teslimat takvimi önerebilirsiniz</li>
</ul>

<h2>Fiyatlama: Ham Petrol ve Döviz Bağlantısı</h2>
<p>Petrokimya türevli ürünlerde fiyat ham petrol fiyatlarıyla, solventlerde ise euro/dolar kuruyla doğrudan ilişkilidir. Uzun vadeli sözleşmelerde:</p>
<ul>
  <li>Fiyat güncelleme formülünü ihale teklifine dahil edin (ICIS veya Platts endeksi referans alınabilir)</li>
  <li>Hammadde fiyatı değişiminde %10 eşiğin aşılması halinde revizyon hakkı talep edin</li>
  <li>Döviz kuru bağlantısını sözleşmeye ekleyin</li>
</ul>

<h2>Çevre Dostu Ürünler: Rekabet Avantajı</h2>
<p>Biyobozunur, düşük VOC (uçucu organik bileşik) içerikli veya fosil kaynaklı olmayan kimyasallar; çevre politikası olan büyük sanayi kuruluşlarında ve kamu ihalelerinde giderek daha yüksek teknik puan almaktadır. ISO 14001 belgesi ve ekoloji sertifikaları (EU Ecolabel, Nordic Swan) rekabet avantajı sağlar.</p>

<h2>Tedport''ta Kimya Tedarikçisi Profili</h2>
<p>Ürün kategorilerinizi (su arıtma kimyasalları, endüstriyel temizleyiciler, proses kimyasalları gibi), depolama kapasitesi ve ADR taşıma yetkinliğinizi profilinize ekleyin. Sertifikalarınızı ve REACH uyumunuzu vurgulayın. Hizmet verdiğiniz sektörleri (tekstil, gıda, metal işleme gibi) belirtin.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-28 09:30:00+03',
  'Kimya ve Endüstriyel Kimyasal Tedarikinde İhale Rehberi | Tedport',
  'Endüstriyel kimyasal ihalelerinde GBF/SDS zorunluluğu, REACH uyumu, tehlikeli madde taşıma ve fiyatlama stratejileri.'
),

-- ─────────────────────────────────────────────────────────────────
-- 5. Enerji ve Yenilenebilir Enerji
-- ─────────────────────────────────────────────────────────────────
(
  'enerji-yenilenebilir-enerji-ihale-rehberi',
  'Enerji ve Yenilenebilir Enerji İhalelerinde Tedarikçi Rehberi',
  'Güneş paneli, rüzgar ekipmanı, enerji depolama ve EPC projeleri için ihale gereklilikleri. Türkiye''deki YEKA ve kurumsal enerji ihalelerinde başarılı olma rehberi.',
  '<h2>Türkiye''de Enerji Sektöründe İhale Fırsatları</h2>
<p>Türkiye''nin 2035 yılına kadar yenilenebilir enerji kapasitesini ikiye katlama hedefi; güneş paneli, rüzgar türbini, enerji depolama sistemi, şarj istasyonu ve akıllı şebeke bileşenlerine yönelik ihaleleri patlatmış durumdadır. Bu ihaleler hem YEKA (Yenilenebilir Enerji Kaynak Alanları) müzayedeleri gibi devasa kamu projeleri hem de fabrika çatı GES''leri ve enerji verimliliği projeleri gibi özel sektör alımları şeklinde gerçekleşmektedir.</p>

<h2>İhale Kategorileri</h2>
<h3>YEKA ve Kamu Enerji İhaleleri</h3>
<p>EPDK ve YEKA müzayedeleri, devlet destekli büyük enerji projelerinin temel alım mekanizmasıdır. Bu ihalelere doğrudan katılım için yüksek sermaye gücü ve teknik yeterlilik aranır. Ancak kazanan EPC/EPCS müteahhitlerine alt tedarikçi olmak KOBİ''ler için kapıyı aralar.</p>
<h3>Kurumsal GES ve Enerji Verimliliği İhaleleri</h3>
<p>Fabrikalar, AVM''ler, organize sanayi bölgeleri ve kamu binaları çatı/arazi güneş enerjisi sistemleri için düzenli ihale açar. Bu ihaleler daha erişilebilir büyüklüktedir.</p>
<h3>EV Şarj Altyapısı</h3>
<p>Belediyeler, otoparklar ve kurumsal filoları olan şirketler EV şarj istasyonu alımlarını hızlandırmaktadır. Bu nispeten yeni kategoride referans avantajı henüz belirleyici değildir; erken girenler için büyük fırsat mevcuttur.</p>

<h2>Zorunlu Sertifikalar</h2>
<ul>
  <li><strong>IEC 61215 / IEC 61730:</strong> Güneş paneli performans ve güvenlik standardı (zorunlu)</li>
  <li><strong>IEC 62109:</strong> İnvertör güvenlik standardı</li>
  <li><strong>MCS veya TÜV/UL belgesi:</strong> Ekipmanlara güven ve prim değer katar</li>
  <li><strong>EPDK Lisansı:</strong> Enerji üretim, dağıtım veya ticaret faaliyetleri için</li>
  <li><strong>ISO 9001 + ISO 14001:</strong> Büyük alıcılarda standart şart haline geldi</li>
</ul>

<h2>EPC Sözleşme Modelini Anlayın</h2>
<p>Enerji projelerinin büyük bölümü EPC (Engineering, Procurement, Construction) modeli üzerinden yürütülür. Bu modelde tedarikçi sadece ürün değil; tasarım, tedarik ve kurulum süreçlerini de üstlenir. EPC modelinde:</p>
<ul>
  <li>Performans garantisi (yıllık üretim kWh/kWp) teklif dosyasına dahil edilir</li>
  <li>Banka teminat mektubu ve performans sigortası genellikle zorunludur</li>
  <li>Sistem ömrü boyunca O&M (işletme ve bakım) hizmeti sunmak uzun vadeli gelir sağlar</li>
</ul>

<h2>Fiyatlandırma Dinamikleri</h2>
<p>Güneş paneli fiyatları 2023-2025 döneminde önemli ölçüde düştü. Fiyat baskısı yoğundur. Farklılaşma için:</p>
<ul>
  <li>Sistem verimliliği ve yıllık üretim garantisini öne çıkarın</li>
  <li>Finansman/leasing çözümleri sunun (küçük alıcılar için belirleyici)</li>
  <li>Hızlı kurulum süresi ve proje referansları güçlü satış argümanlarıdır</li>
</ul>

<h2>Tedport''ta Enerji Tedarikçisi Profili</h2>
<p>Kurulu güç kapasitesi (kWp cinsinden tamamladığınız projeler), hizmet bölgesi, ekipman markaları ve sertifikalar profilinizin olmazsa olmazlarıdır. EPC mi yoksa sadece ekipman mı sattığınızı net belirtin. Referans proje görselleri güven oluşturmanın en hızlı yoludur.</p>',
  'Sektör Rehberi',
  8,
  '#0891b2',
  '2026-06-28 10:00:00+03',
  'Enerji ve Yenilenebilir Enerji İhalelerinde Tedarikçi Rehberi | Tedport',
  'Güneş enerjisi, rüzgar ve enerji depolama ihalelerinde sertifikalar, EPC sözleşme modeli ve Türkiye''deki YEKA fırsatları.'
),

-- ─────────────────────────────────────────────────────────────────
-- 6. Otomotiv Yan Sanayi
-- ─────────────────────────────────────────────────────────────────
(
  'otomotiv-yan-sanayi-ihale-rehberi',
  'Otomotiv Yan Sanayinde Tedarikçi Olmak: İhale ve Onay Süreci',
  'Otomotiv OEM tedarikçiliği ve yan sanayi ihalelerinde IATF 16949, PPAP süreci, SOP onayı ve Tier-1/Tier-2 tedarikçi olmak için kapsamlı rehber.',
  '<h2>Otomotiv Yan Sanayi İhalelerinin Özellikleri</h2>
<p>Türkiye, yıllık 1,5 milyonun üzerinde araç üretimiyle Avrupa''nın önemli otomotiv üreticilerinden biridir. Bu üretim hacmi; motor parçaları, şasi bileşenleri, plastik döküm, elektrik harnes, deri döşeme, cam ve ayna ürünlerine yönelik devasa bir tedarik zinciri oluşturmaktadır. Otomotiv tedarikçiliği, diğer sektörlere kıyasla çok daha uzun ve zorlu bir onay sürecini gerektirir; ancak bir kez onaylandığında yıllarca süren düzenli gelir sağlar.</p>

<h2>Tedarikçi Seviyeleri (Tier Yapısı)</h2>
<ul>
  <li><strong>Tier-1 Tedarikçi:</strong> Doğrudan OEM''e (Oyak-Renault, Ford Otosan, Toyota gibi) tedarik. En yüksek kalite ve süreç gereklilikleri.</li>
  <li><strong>Tier-2 Tedarikçi:</strong> Tier-1 firmalara hammadde, yarı mamul veya bileşen sağlar. Daha erişilebilir onay süreci.</li>
  <li><strong>Tier-3 ve alt:</strong> Hammadde üreticileri ve standart bileşen tedarikçileri.</li>
</ul>
<p>Otomotiv tedarik zincirine yeni girecek firmalar için Tier-2 başlangıç noktası genellikle daha gerçekçidir.</p>

<h2>Zorunlu Kalite Standartları</h2>
<h3>IATF 16949</h3>
<p>Otomotiv sektörüne özgü kalite yönetim sistemi standardıdır. ISO 9001 gerekliliklerini kapsar ve üzerine otomotiv spesifik gereklilikler ekler. Herhangi bir OEM''e veya Tier-1 firmaya tedarik için bu sertifika artık fiilen zorunludur.</p>
<h3>APQP (İleri Ürün Kalite Planlaması)</h3>
<p>Yeni parça geliştirme sürecinin yönetildiği çerçevedir. OEM''lerin büyük çoğunluğu tedarikçilerden APQP disiplinlerine uyum bekler.</p>
<h3>PPAP (Üretim Parça Onay Süreci)</h3>
<p>Seri üretime geçmeden önce parçanın tasarım gerekliliklerini karşıladığını kanıtlayan kapsamlı onay paketidir. PPAP Seviye 3 paketi hazırlamak standart beklentidir ve şunları içerir:</p>
<ul>
  <li>Tasarım kayıtları ve boyutsal ölçüm raporları</li>
  <li>Malzeme test sertifikaları</li>
  <li>Süreç FMEA ve kontrol planı</li>
  <li>Başlangıç proses yetenek analizi (Cpk değerleri)</li>
  <li>Görünüm onay raporu</li>
</ul>

<h2>Fiyatlandırma ve Uzun Vadeli Sözleşmeler</h2>
<p>Otomotiv tedarik sözleşmeleri genellikle 3-5 yıllık platform ömrüyle bağlantılıdır. OEM''ler her yıl %3-8 maliyet düşürme (cost-down) talep eder. Bu baskıya hazırlıklı olmak gerekir:</p>
<ul>
  <li>Süreç verimliliği yatırımları cost-down taahhütlerini karşılamanın yolunu açar</li>
  <li>Nominal fiyat sabit tutulurken spesifikasyon iyileştirmesi sunmak müzakerelerde zemin kazanır</li>
  <li>Döviz riskini sözleşmeye endeksleme maddesi ekleyin (özellikle ithal içerik varsa)</li>
</ul>

<h2>Tedport''ta Otomotiv Yan Sanayi Profili</h2>
<p>IATF 16949 belgenizi, çalıştığınız OEM ve Tier-1 referanslarınızı ve üretim kabiliyetlerinizi (presleme, döküm, kaynak, CNC gibi) profilinize ekleyin. Hangi araç platformlarına (binek, ticari, kamyon) parça ürettiğinizi belirtin. Yıllık üretim kapasitesi ve kalıp/takım yatırımı kapasitesi büyük alıcılar için önemli bilgilerdir.</p>',
  'Sektör Rehberi',
  8,
  '#0891b2',
  '2026-06-28 10:30:00+03',
  'Otomotiv Yan Sanayinde Tedarikçi Olmak: İhale ve Onay Süreci | Tedport',
  'Otomotiv tedarikçiliğinde IATF 16949, PPAP süreci, Tier-1/Tier-2 yapısı ve uzun vadeli OEM sözleşmeleri hakkında kapsamlı rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 7. Ambalaj ve Paketleme
-- ─────────────────────────────────────────────────────────────────
(
  'ambalaj-paketleme-ihale-rehberi',
  'Ambalaj ve Paketleme Sektöründe İhale ve Tedarik Rehberi',
  'Karton kutu, plastik ambalaj, etiket ve endüstriyel paketleme ihalelerinde standartlar, baskı/tasarım süreci ve sürdürülebilirlik gereklilikleri hakkında rehber.',
  '<h2>Ambalaj: Her Sektörün İhtiyacı</h2>
<p>Ambalaj ve paketleme ürünleri; gıda, ilaç, kimya, otomotiv, e-ticaret ve hemen her sektörde sürekli talep görür. Bu evrensel talep, ambalaj tedarikçilerine geniş bir pazar sunar. Türkiye''deki ambalaj ihaleleri; karton/mukavva kutu, plastik kap ve şişe, esnek ambalaj, etiket-barkod, streç film ve endüstriyel ambalaj olmak üzere birçok kategoride yürütülmektedir.</p>

<h2>Kategoriye Göre Gereklilikler</h2>
<h3>Gıda Temas Ambalajı</h3>
<p>Gıdayla temas eden her ambalaj için AB Yönetmeliği (EC) 1935/2004 ve Türk Gıda Kodeksi uyumu zorunludur. "Food grade" onaylı hammadde kullanıldığını kanıtlayan migration test raporları şartnameyle birlikte istenebilir.</p>
<h3>İlaç ve Medikal Ambalaj</h3>
<p>İlaç ambalajı ISO 15378 standardına tabidir. Blister, ampul kutusu ve medikal steril ambalaj FDA veya CE onaylı hammadde gerektirebilir. Bu kategoride tedarikçi audit süreci son derece titizdir.</p>
<h3>Tehlikeli Madde Ambalajı</h3>
<p>Kimyasal, boya veya tehlikeli sıvı ambalajı için ADR onaylı ambalaj belgesi ve UN kodlaması zorunludur. Bu belge olmadan ürün taşınamaz.</p>
<h3>E-ticaret ve Lojistik Ambalaj</h3>
<p>Darbe emici özellikler, nem direnci ve barkod okutulabilirlik bu kategorinin temel gereklilikleridir. ISTA veya ASTM D4169 testi ile ambalajın taşıma koşullarına dayanıklılığını kanıtlamak avantaj sağlar.</p>

<h2>Baskı ve Tasarım Süreci</h2>
<p>Kurumsal alıcıların çoğu ambalajda marka baskısı (logo, barkod, içerik bilgisi) ister. Bu süreçte:</p>
<ul>
  <li>Renk uyumu için Pantone referansları alın; CMYK baskıda renk sapması yaygındır</li>
  <li>Kurşunsuz ve gıda güvenli mürekkep kullanımını belgeleyin</li>
  <li>Klişe/kalıp maliyetini ayrıca fiyatlandırın; teklif bedelini şeffaf tutun</li>
  <li>Dijital baskı için minimum sipariş miktarı flex, ofset için yüksektir — buna göre fiyat yapılandırın</li>
</ul>

<h2>Sürdürülebilirlik: Giderek Şart Haline Geliyor</h2>
<p>2025 AB Ambalaj Yönetmeliği (PPWR) kapsamında geri dönüştürülebilir içerik zorunluluğu Türk tedarikçileri de etkiliyor. Büyük kurumsal alıcılar:</p>
<ul>
  <li>%30 veya üzeri geri dönüştürülmüş hammadde içeriği</li>
  <li>FSC veya PEFC belgeli kağıt/karton</li>
  <li>Biyobozunur veya kompostlanabilir ambalaj seçenekleri talep etmektedir</li>
</ul>
<p>Bu belgelere sahip tedarikçiler çevre politikası olan büyük firmaların onaylı listelerine daha hızlı girer.</p>

<h2>Tedport''ta Ambalaj Tedarikçisi Profili</h2>
<p>Üretim kapasitesi (günlük/aylık adet veya ton), ambalaj kategorileri (karton, plastik, esnek, etiket), baskı imkânları ve minimum sipariş miktarlarınızı profilinize ekleyin. Food grade, medikal veya ADR onaylı ürün üretiyorsanız bunu özellikle vurgulayın; bu bilgi doğru alıcıyla eşleşmenizi hızlandırır.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-28 11:00:00+03',
  'Ambalaj ve Paketleme Sektöründe İhale ve Tedarik Rehberi | Tedport',
  'Gıda temas ambalajı, ilaç ambalajı ve e-ticaret paketleme ihalelerinde standartlar, baskı süreci ve sürdürülebilirlik gereklilikleri.'
),

-- ─────────────────────────────────────────────────────────────────
-- 8. Çevre Teknolojileri ve Atık Yönetimi
-- ─────────────────────────────────────────────────────────────────
(
  'cevre-atik-yonetimi-ihale-rehberi',
  'Çevre Teknolojileri ve Atık Yönetiminde İhale Fırsatları',
  'Su arıtma, atık bertaraf, hava filtrasyon ve çevre izleme sistemleri ihalelerinde çevre mevzuatı uyumu, lisanslama ve artan ESG talepleri hakkında rehber.',
  '<h2>Neden Bu Sektör Hızla Büyüyor?</h2>
<p>Türkiye''nin AB yeşil mutabakat uyum süreci, artacak karbon vergisi düzenlemeleri ve kurumsal ESG baskısı; çevre teknolojileri ve atık yönetimi sektörünü en hızlı büyüyen tedarik kategorilerinden biri haline getirdi. Sanayi tesisleri, belediyeler ve büyük organize sanayi bölgeleri; atık su arıtma, hava filtrasyon, katı atık bertaraf ve çevre izleme sistemleri için giderek artan hacimde ihale açmaktadır.</p>

<h2>İhale Kategorileri</h2>
<h3>Su ve Atık Su Arıtma</h3>
<p>Endüstriyel proses suyu arıtma, atık su arıtma tesisi, içme suyu dezenfeksiyonu ve geri kazanım sistemleri. Belediyeler ve OSB''ler bu kategorinin en büyük alıcılarıdır. Tesis ihaleleri genellikle anahtar teslim (EPC) modelde yapılır.</p>
<h3>Hava Filtrasyon ve Emisyon Kontrolü</h3>
<p>Fabrika bacası emisyon filtreleri, toz tutma sistemleri (toz filtresi, siklonu), VOC giderme sistemleri ve hava kalitesi izleme istasyonları. Çevre izin şartları kapsamında zorunlu ekipmanlar olduğundan satın alma kaçınılmazdır.</p>
<h3>Katı Atık ve Tehlikeli Atık Yönetimi</h3>
<p>Atık toplama, ayrıştırma, presleme ve bertaraf ekipmanları. Tehlikeli atık hizmetleri için özel lisans zorunludur ve piyasadaki lisanslı firma sayısı sınırlıdır; bu da fiyat avantajı sağlar.</p>
<h3>Çevre İzleme ve Ölçüm Sistemleri</h3>
<p>Sürekli Emisyon Ölçüm Sistemi (CEMS), su kalitesi monitörleri, gürültü ölçüm cihazları. Bu kategoride kalibrasyon ve akreditasyon gereklilikleri öne çıkar.</p>

<h2>Zorunlu Lisans ve İzinler</h2>
<ul>
  <li><strong>Çevre İzni/Lisansı:</strong> Atık bertaraf ve geri kazanım faaliyetleri için Çevre ve Şehircilik Bakanlığı''ndan alınan lisans zorunludur</li>
  <li><strong>Tehlikeli Atık Taşıma Lisansı:</strong> ÇED ve taşıma güzergah izni</li>
  <li><strong>Teknik Eleman Belgesi:</strong> Arıtma tesisi işletimi için yetkin mühendis gerekliliği</li>
  <li><strong>ISO 14001:</strong> Çevre yönetim sistemi belgesi; büyük sanayi alıcıları için fiilen zorunlu</li>
</ul>

<h2>Proje Bazlı vs Hizmet Bazlı Sözleşmeler</h2>
<p>Bu sektörde iki temel model vardır:</p>
<ul>
  <li><strong>EPC/Anahtar Teslim:</strong> Sistem tasarımı + tedarik + kurulum + devreye alma. Daha yüksek gelir, daha yüksek teknik yeterlilik şartı.</li>
  <li><strong>O&M (İşletme ve Bakım) Hizmeti:</strong> Kurulu sistemin işletilmesi. Düzenli gelir akışı, uzun vadeli sözleşmeler (3-10 yıl). Bu model çevre şirketi için en istikrarlı büyüme yoludur.</li>
</ul>

<h2>ESG Baskısı: En Büyük Büyüme Motoru</h2>
<p>Büyük sanayi grupları ve halka açık şirketler artık sürdürülebilirlik raporlarında çevre hizmetleri tedarikçilerini listeleme zorunluluğuyla karşı karşıyadır. Bu şirketler güvenilir, belgeli çevre tedarikçisi bulmakta güçlük çekmektedir. Doğru konumlanmış çevre firmaları için bu eksiklik büyük bir fırsat anlamına gelmektedir.</p>

<h2>Tedport''ta Çevre Tedarikçisi Profili</h2>
<p>Çevre izin belgenizi, ISO 14001''inizi ve hizmet kategorilerinizi profilinize ekleyin. Tamamladığınız arıtma tesisi kapasitelerini (m³/gün), hizmet bölgenizi ve referans sanayi müşterilerinizi belirtin. ESG raporlamasına destek verip vermediğinizi vurgulayın; bu giderek artan bir talep kaynağıdır.</p>',
  'Sektör Rehberi',
  7,
  '#0891b2',
  '2026-06-28 11:30:00+03',
  'Çevre Teknolojileri ve Atık Yönetiminde İhale Fırsatları | Tedport',
  'Su arıtma, hava filtrasyon ve atık yönetimi ihalelerinde çevre lisansları, ESG talepleri ve anahtar teslim proje modeli hakkında rehber.'
);
