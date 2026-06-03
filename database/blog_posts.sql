-- Enes Doğanay | 3 Haziran 2026: Blog yazıları tablosu, RLS politikaları ve seed içerikleri

CREATE TABLE IF NOT EXISTS blog_posts (
    id          BIGSERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    summary     TEXT,
    content     TEXT,
    category    TEXT DEFAULT 'Rehber',
    reading_time INT DEFAULT 5,
    cover_color TEXT DEFAULT '#2563eb',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    seo_title   TEXT,
    seo_description TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published blog posts"
    ON blog_posts FOR SELECT
    USING (is_published = TRUE);

-- ─────────────────────────────────────────────────────────────────
-- SEED DATA — 5 Tanıtım Yazısı
-- ─────────────────────────────────────────────────────────────────

INSERT INTO blog_posts (slug, title, summary, content, category, reading_time, cover_color, published_at, seo_title, seo_description) VALUES

(
  'turkiyede-ihale-sureci-nasil-isler',
  'Türkiye''de İhale Süreci Nasıl İşler? Kapsamlı Rehber',
  'İhale türleri, süreç aşamaları ve dijital platformların sürece katkısını kapsamlı şekilde öğrenin. Hem alıcı hem tedarikçi perspektifinden pratik rehber.',
  '<h2>İhale Nedir?</h2>
<p>İhale; bir kurum ya da işletmenin ihtiyaç duyduğu ürün, hizmet veya yapım işini piyasadan temin etmek için birden fazla firmayı rekabete davet etmesi ve en uygun teklifi seçmesi sürecidir. Türkiye''de kamu kurumları 4734 sayılı Kamu İhale Kanunu çerçevesinde hareket ederken özel şirketler kendi iç politikalarını belirler.</p>
<p>Son yıllarda dijital dönüşümle birlikte B2B ihale süreçleri büyük ölçüde online platformlara taşınmıştır. Bu dönüşüm sayesinde alıcılar coğrafi sınır tanımadan tedarikçi havuzuna ulaşırken, firmalar da kendi sektörlerindeki ihalelerden anında haberdar olabilmektedir.</p>
<h2>İhale Türleri</h2>
<h3>Açık İhale</h3>
<p>Gerekli şartları taşıyan tüm firmaların teklif verebileceği en yaygın ihale türüdür. Şeffaflık ve geniş rekabet ortamı sağlar. Özellikle standart ürün ve hizmet alımlarında tercih edilir.</p>
<h3>Davetli İhale</h3>
<p>Alıcı firmanın önceden belirlediği, güvenilirliğini teyit ettiği tedarikçilere özel davet gönderilir. Hassas projeler, özel uzmanlık gerektiren işler veya uzun vadeli iş ilişkilerinde sıklıkla kullanılır.</p>
<h3>Pazarlık Usulü</h3>
<p>Alıcı ile seçili tedarikçiler arasında fiyat, koşullar ve teknik detaylar üzerine karşılıklı müzakere yürütülür. Karmaşık, acil veya spesifikasyonu önceden tanımlanamayan işlerde uygundur.</p>
<h2>İhale Sürecinin 6 Temel Aşaması</h2>
<ul>
  <li><strong>İhtiyaç Analizi:</strong> Alıcı firma neye ihtiyacı olduğunu teknik şartname ile netleştirir. Miktar, kalite standardı ve teslim koşulları bu aşamada belirlenir.</li>
  <li><strong>İhale İlanı:</strong> Süreç platform veya resmi kanallar üzerinden duyurulur. İhale kapsamı, son başvuru tarihi ve katılım koşulları paylaşılır.</li>
  <li><strong>Tekliflerin Toplanması:</strong> İlgili tedarikçiler fiyat, teslim süresi ve teknik detayları içeren tekliflerini sunar.</li>
  <li><strong>Değerlendirme:</strong> Teklifler fiyat, kalite, referans ve kapasite gibi kriterlere göre karşılaştırılır ve puanlanır.</li>
  <li><strong>Kazanan Seçimi:</strong> En uygun teklif kabul edilir. Diğer katılımcılara bildirim yapılır.</li>
  <li><strong>Sözleşme ve Teslimat:</strong> Taraflar mutabık kaldıkları koşulları sözleşmeye bağlar, teslimat takvimi devreye girer.</li>
</ul>
<h2>Dijital İhale Platformları Ne Sağlar?</h2>
<p>Geleneksel süreçlerde posta, faks ve yüz yüze toplantılar kaçınılmazken, dijital platformlar bu tabloyu köklü biçimde değiştirdi:</p>
<ul>
  <li>Tüm teklifler anlık olarak tek ekranda karşılaştırılabilir</li>
  <li>Tedarikçi iletişimi merkezi mesajlaşma ile takip edilir</li>
  <li>Teklif revizyonları ve geçmiş otomatik kaydedilir</li>
  <li>Akıllı puanlama algoritmaları fiyat-teslim dengesini optimize eder</li>
  <li>Analitik raporlar sayesinde veri odaklı kararlar alınır</li>
</ul>
<h2>Sonuç</h2>
<p>İhale süreci; doğru yönetildiğinde hem alıcılar için maliyet avantajı hem de tedarikçiler için büyüme fırsatı sunar. Tedport gibi B2B platformlar bu süreci standart hale getirerek iki taraf için de öngörülebilir ve şeffaf bir ortam yaratır.</p>',
  'İhale Rehberi',
  7,
  '#1d4ed8',
  '2026-06-01 09:00:00+03',
  'Türkiye''de İhale Süreci Nasıl İşler? | Tedport Rehber',
  'İhale nedir, türleri nelerdir ve süreç nasıl işler? Hem alıcı hem tedarikçi perspektifinden Türkiye''deki ihale dünyasını anlatan kapsamlı rehber.'
),

(
  'b2b-satinalma-kritik-hatalar',
  'B2B Satınalmada 7 Kritik Hata ve Nasıl Kaçınırsınız',
  'Kurumsal satınalma süreçlerinde sıkça yapılan maliyetli hatalar, bunların işletmeye etkisi ve pratik çözüm önerileri.',
  '<h2>Neden B2B Satınalma Bu Kadar Kritik?</h2>
<p>Bir işletmenin toplam giderlerinin büyük çoğunluğu satınalma kararlarından kaynaklanır. Araştırmalar, kurumsal satınalma süreçlerindeki optimizasyonun şirket kârlılığını ortalama %8-15 oranında artırabildiğini göstermektedir. Ancak pek çok işletme aynı hataları tekrarlamakta ve bu fırsatı kaçırmaktadır.</p>
<h2>Hata 1: Tek Tedarikçiye Bağımlı Kalmak</h2>
<p>Uzun süreli iş ilişkisi güven ve pratiklik sağlasa da tek tedarikçi bağımlılığı ciddi riskler doğurur. Fiyat artışlarına itiraz edemez, alternatif sunamazsınız. <strong>Çözüm:</strong> Her kritik ürün kategorisi için en az 2-3 onaylı tedarikçi listesi oluşturun.</p>
<h2>Hata 2: Sadece Fiyata Odaklanmak</h2>
<p>En düşük fiyatlı teklif her zaman en avantajlı seçenek değildir. Teslim süresi, ödeme koşulları, garanti kapsamı ve tedarikçinin finansal istikrarı toplam maliyet hesabında belirleyici rol oynar. <strong>Çözüm:</strong> Teklifleri ağırlıklı puanlama sistemi ile değerlendirin; fiyata %50-70, teslim ve kaliteye kalan payı verin.</p>
<h2>Hata 3: İhtiyaç Analizini Atlamak</h2>
<p>Yeterince netleştirilmemiş teknik şartname gereksiz ürün alımına, iade süreçlerine ve zaman kaybına yol açar. <strong>Çözüm:</strong> İhale açmadan önce kullanıcı birimlerle ihtiyaç toplantısı yapın ve şartnameyi yazılı olarak onaylayın.</p>
<h2>Hata 4: Tedarikçi Referans Kontrolü Yapmamak</h2>
<p>Fiyat uygun görünse de geçmiş performansı bilinmeyen bir tedarikçiyle çalışmak gecikme, kalite sorunu veya sözleşme ihlali riskini artırır. <strong>Çözüm:</strong> Onboard etmeden önce en az 2 referans kontrol edin ve varsa online platform değerlendirmelerini inceleyin.</p>
<h2>Hata 5: Sözleşmeyi Ihmal Etmek</h2>
<p>Sözlü anlaşma veya zayıf hazırlanmış sözleşmeler, teslimat gecikmelerinde ya da kalite uyuşmazlıklarında sizi savunmasız bırakır. <strong>Çözüm:</strong> Teslimat tarihi, kalite standardı, ceza maddeleri ve ödeme koşullarını mutlaka sözleşmeye yazın.</p>
<h2>Hata 6: Teklif Sürecini Belgelememek</h2>
<p>Hangi teklifin neden seçildiğine dair kayıt tutulmadığında iç denetim, vergi incelemeleri ve olası itirazlarda ciddi sorunlar yaşanır. <strong>Çözüm:</strong> Değerlendirme kriterlerini ve kararı dijital ortamda kayıt altına alın.</p>
<h2>Hata 7: Uzun Vadeli Ortaklık Potansiyelini Görmezden Gelmek</h2>
<p>Her alımı ayrı bir işlem olarak ele almak, sözleşme yenileme sürtüşmesi ve güven eksikliği yaratır. <strong>Çözüm:</strong> Stratejik tedarikçilerle performans bazlı uzun vadeli çerçeve anlaşmalar yapın.</p>
<h2>Özet</h2>
<p>B2B satınalma; doğru sistem ve disiplinle yönetildiğinde işletmenin en güçlü rekabet avantajlarından biri olabilir. Yukarıdaki hataları erken fark etmek, hem maliyetleri düşürür hem de tedarik zinciri dayanıklılığını artırır.</p>',
  'Satınalma',
  6,
  '#059669',
  '2026-06-02 09:00:00+03',
  'B2B Satınalmada 7 Kritik Hata | Tedport Rehber',
  'Kurumsal satınalma süreçlerinde sıkça yapılan 7 kritik hatayı ve bunlardan nasıl kaçınacağınızı öğrenin. Pratik çözümlerle satınalma sürecinizi optimize edin.'
),

(
  'tedarikci-degerlendirme-nasil-yapilir',
  'Doğru Tedarikçiyi Seçmenin 5 Adımı',
  'Tedarikçi değerlendirme kriterleri, fiyat ötesi faktörler ve uzun vadeli güvenilir iş ortaklığı kurmanın yollarını öğrenin.',
  '<h2>Tedarikçi Seçimi Neden Bu Kadar Önemli?</h2>
<p>İşletmenizin kalitesi büyük ölçüde tedarikçilerinizin kalitesiyle şekillenir. Yanlış tedarikçi seçimi; üretim aksaklıklarına, müşteri şikayetlerine ve beklenmedik maliyetlere yol açabilir. Bu nedenle tedarikçi değerlendirmesi, stratejik bir süreç olarak ele alınmalıdır.</p>
<h2>Adım 1: İhtiyaç Profilini Netleştirin</h2>
<p>Öncelikle neye ihtiyacınız olduğunu açıkça tanımlayın. Ürün özellikleri, miktar, sıklık, lojistik gereksinimler ve kalite standartlarını yazılı hale getirin. Bu profil, tedarikçi arayışında filtreleme ölçütlerinizi belirleyecektir.</p>
<h2>Adım 2: Aday Listesi Oluşturun</h2>
<p>B2B platformlar, sektör fuarları, ticaret odası kaynakları ve referans ağınızı kullanarak geniş bir aday listesi oluşturun. Tek bir kaynak yerine çoklu kanallardan gelen adaylar havuzunuzun kalitesini artırır.</p>
<ul>
  <li>Tedport gibi platformlarda sektör filtreleriyle önceden doğrulanmış firmalar arayın</li>
  <li>Referans aldığınız firmalardan tavsiye isteyin</li>
  <li>LinkedIn ve sektörel dernekleri takip edin</li>
</ul>
<h2>Adım 3: Ön Değerlendirme Kriterleri Uygulayın</h2>
<p>Her adayı aşağıdaki temel kriterler çerçevesinde filtreleyin:</p>
<ul>
  <li><strong>Finansal İstikrar:</strong> Uzun vadeli çalışacaksanız firmanın mali sağlığı kritiktir</li>
  <li><strong>Üretim/Hizmet Kapasitesi:</strong> Büyüme dönemlerinizde talebinizi karşılayabilir mi?</li>
  <li><strong>Kalite Sertifikaları:</strong> ISO, CE, TSE gibi belgeler güvenilirlik göstergesidir</li>
  <li><strong>Teslimat Performansı:</strong> Geçmiş müşterilerdeki zamanında teslimat oranını sorgulayın</li>
  <li><strong>İletişim Kalitesi:</strong> Sorularınıza ne kadar hızlı ve net yanıt veriyorlar?</li>
</ul>
<h2>Adım 4: Teklif Karşılaştırması Yapın</h2>
<p>Sadece fiyatı değil, toplam maliyet analizini (Total Cost of Ownership) hesaplayın. Kargo, sigorta, iade koşulları, ödeme vadesi ve olası gecikme maliyetlerini dahil edin. Ağırlıklı puanlama tablosu kullanmak bu karşılaştırmayı objektif hale getirir.</p>
<h2>Adım 5: Pilot Sipariş ile Test Edin</h2>
<p>Uzun vadeli sözleşme yapmadan önce küçük ölçekli bir pilot sipariş verin. Bu pilot süreç; ürün kalitesi, paketleme, teslimat hızı ve iletişim kalitesini gerçek koşullarda ölçmenizi sağlar. Pilot sonuçlarına göre kararınızı netleştirin.</p>
<h2>Uzun Vadeli Ortaklık İçin Altın Kural</h2>
<p>İyi bir tedarikçi ilişkisi tek yönlü değildir. Ödeme sürelerine saygı gösterin, geri bildirimleri paylaşın ve büyüme planlarınızı zamanında iletin. Karşılıklı güven üzerine kurulu ortaklıklar kriz dönemlerinde işletmenizin en büyük güvencesi olur.</p>',
  'Rehber',
  5,
  '#0d9488',
  '2026-06-02 14:00:00+03',
  'Doğru Tedarikçiyi Seçmenin 5 Adımı | Tedport Rehber',
  'Tedarikçi değerlendirme kriterleri ve seçim süreci rehberi. Fiyat ötesi faktörler, pilot sipariş yöntemi ve uzun vadeli ortaklık stratejilerini öğrenin.'
),

(
  'ihale-teklifi-hazirlama-rehberi',
  'Kazanan İhale Teklifi Hazırlamanın 8 Sırrı',
  'Rekabetçi ve ikna edici bir ihale teklifi hazırlamak için teknik, mali ve stratejik açıdan nelere dikkat etmeniz gerektiğini öğrenin.',
  '<h2>Teklif Neden Bu Kadar Belirleyici?</h2>
<p>Bir ihaleye katılmak için harcanan zaman ve efor, teklifin kalitesiyle doğru orantılıdır. Hazırlıksız veya eksik bir teklif, uygun fiyat sunmuş olsanız bile sizi ihale dışı bırakabilir. Başarılı tedarikçiler teklif hazırlamayı bir satış aracı olarak görür.</p>
<h2>1. İhale Şartnamesini Satır Satır Okuyun</h2>
<p>Teknik şartname, teslimat koşulları ve değerlendirme kriterlerini eksiksiz inceleyin. Alıcının öncelikleri genellikle şartname dilinde saklıdır; buna göre teklifinizi şekillendirin.</p>
<h2>2. Toplam Maliyeti Gerçekçi Hesaplayın</h2>
<p>Kar marjını yüksek tutmak için maliyetleri küçümsemeyin; kazansanız bile zarar edebilirsiniz. Hammadde, işçilik, lojistik, sigorta ve olası döviz kuru değişkenlerini dahil eden gerçekçi bir maliyet tablosu oluşturun.</p>
<h2>3. Fiyatı Gerekçelendirin</h2>
<p>Rakiplerden düşük fiyat sunuyorsanız alıcı bu farkın neden kaynaklandığını merak eder. Yüksek fiyat sunuyorsanız ek değer açıkça ortaya konmalıdır. Fiyat satırının yanına kısa bir açıklama eklemek güven artırır.</p>
<h2>4. Referanslarınızı Öne Çıkarın</h2>
<p>Benzer işlerde çalıştığınız firma isimleri ve proje özetleri güvenilirliğinizi somutlaştırır. Mümkünse sektöre özel referanslar seçin; alıcı kendi deneyimiyle örtüşen örneklere daha çok değer verir.</p>
<h2>5. Teslim Takvimini Gerçekçi Kurun</h2>
<p>En yaygın hata, kazanmak adına gerçekçi olmayan teslimat tarihi taahhüdüdür. Geç teslimat hem ceza maddelerini devreye sokar hem de gelecek ihaleler için itibar zedelenir. Biraz daha uzun ama garanti edilebilir bir takvim sunun.</p>
<h2>6. Teknik Detayları Atlamamın</h2>
<p>Alıcının teknik ekibi teklifinizi inceler. Kullanılan malzeme kalitesi, üretim yöntemi, test prosedürleri ve sertifikalar eksiksiz sunulduğunda tekniğiniz lehine fark yaratır.</p>
<h2>7. Ödeme Koşullarına Dikkat Edin</h2>
<p>Uzun vadeli ödeme koşulları nakit akışınızı zorlar. Avans veya kısa vade avantajı karşılığında hafif fiyat indirimi önermek hem alıcıya çekici gelir hem de nakit durumunuzu korur.</p>
<h2>8. Teklifinizi Sade ve Okunabilir Hazırlayın</h2>
<p>Karmaşık, uzun ve dağınık teklifler değerlendirme sürecini zorlaştırır. Ana bilgileri tablo formatında sunun, teknik detayları ek belgede verin. Alıcının kararını kolaylaştırmak teklifinizi öne taşır.</p>
<h2>Son Söz</h2>
<p>İhale teklifi; ürününüzü veya hizmetinizi satmanın ötesinde firmanızın profesyonelliğini ve güvenilirliğini temsil eden bir belgedir. Her teklifi bir vitrin olarak görün.</p>',
  'İhale Rehberi',
  6,
  '#7c3aed',
  '2026-06-03 09:00:00+03',
  'Kazanan İhale Teklifi Hazırlamanın 8 Sırrı | Tedport',
  'Rekabetçi ihale teklifi hazırlama rehberi. Fiyat gerekçelendirme, referans sunumu, teslim takvimi ve alıcıyı ikna etme stratejilerini öğrenin.'
),

(
  'dijital-b2b-satinalma-stratejileri',
  'Dijital Çağda B2B Satınalma: 2026 Stratejileri',
  'Yapay zeka destekli tedarik araçları, veri odaklı karar verme ve dijital platformların işletmelerin satınalma süreçlerini nasıl dönüştürdüğünü keşfedin.',
  '<h2>B2B Satınalma Neden Dijitalleşiyor?</h2>
<p>2020''lerin başında hızlanan dijitalleşme dalgası, B2B satınalma süreçlerini de köklü biçimde dönüştürdü. McKinsey araştırmalarına göre B2B alıcıların %70''inden fazlası artık satın alma sürecinin büyük bölümünü çevrimiçi araçlarla yönetmektedir. Bu dönüşüm; hız, şeffaflık ve maliyet avantajı sağlarken geleneksel yöntemlere bağlı kalan işletmeler rekabet gücünü kaybetme riskiyle karşı karşıya kalmaktadır.</p>
<h2>2026''da Öne Çıkan 5 Dijital Strateji</h2>
<h3>1. Merkezi Tedarikçi Yönetim Platformları</h3>
<p>Dağınık e-posta zincirlerine ve Excel tablolarına son verin. Tüm tedarikçi iletişimini, teklif geçmişini ve sözleşme belgelerini tek bir platformda toplamak hem izlenebilirlik hem de zaman tasarrufu sağlar. Tedport gibi B2B platformlar bu ihtiyaca özel olarak tasarlanmıştır.</p>
<h3>2. Veri Odaklı Tedarikçi Değerlendirmesi</h3>
<p>Sezgiye dayalı kararların yerini veri alıyor. Tedarikçilerin geçmiş teslimat performansı, fiyat tutarlılığı ve iletişim hızı gibi metriklerin kaydedilmesi, gelecekteki ihale kararlarını nesnel temele oturtur. Bu veriler uzun vadede görünmez maliyetleri de gün yüzüne çıkarır.</p>
<h3>3. Akıllı Teklif Puanlama</h3>
<p>Sadece en düşük fiyatı seçmek yerine çok kriterli puanlama algoritmaları fiyat, teslim süresi, garanti koşulları ve tedarikçi profilini ağırlıklı şekilde değerlendirir. Bu yaklaşım hem daha adil hem de daha iyi sonuçlar verir.</p>
<h3>4. Anlık Bildirim ve Uyarı Sistemleri</h3>
<p>Sektörünüzdeki yeni ihalelerden, kendi ihalelerinize gelen tekliflerden ve son başvuru tarihlerinden anlık haberdar olmak rekabette bir adım önde tutmanızı sağlar. Kaçırılan bir ihale fırsatı veya geciken bir teklif yanıtı direkt gelir kaybına dönüşebilir.</p>
<h3>5. Dijital Onboarding ve Sözleşme Yönetimi</h3>
<p>Tedarikçi kayıt, belge doğrulama ve sözleşme imzalama süreçlerini dijitalleştirmek hem işlem hızını artırır hem de hata riskini azaltır. Dijital sözleşmeler arama, arşivleme ve uyum takibi açısından da büyük avantaj sağlar.</p>
<h2>Yapay Zekanın Tedarik Zincirine Etkisi</h2>
<p>2026 itibarıyla yapay zeka destekli araçlar tedarik zinciri yönetiminde aktif rol almaya başladı. Talep tahmini, tedarikçi risk analizi ve otomatik fiyat karşılaştırması bu alanda öne çıkan uygulamalar arasındadır. Platformlara entegre edilen AI asistanlar, satınalma yöneticilerinin rutin görevlerini otomatize ederek stratejik kararlara daha fazla zaman ayırmasını sağlıyor.</p>
<h2>Dijital Dönüşüme Nereden Başlamalı?</h2>
<ul>
  <li>Mevcut satınalma sürecinizi haritaya dökün; darboğazları tespit edin</li>
  <li>Tek bir kategoride pilot dijital ihale başlatın ve sonuçları ölçün</li>
  <li>Tedarikçilerinizi platformu kullanmaya teşvik edin; karşılıklı fayda vurgulayın</li>
  <li>Veri toplamayı erken başlatın; karar kalitesi zamanla artar</li>
</ul>
<h2>Sonuç</h2>
<p>Dijitalleşme bir tercih olmaktan çıkıp rekabet koşulu haline geliyor. B2B satınalma süreçlerini dijital araçlarla dönüştüren işletmeler, hem maliyetlerini düşürüyor hem de tedarik zinciri dayanıklılıklarını artırıyor. Doğru platformla bu dönüşüme bugün başlayabilirsiniz.</p>',
  'Dijital Dönüşüm',
  5,
  '#dc2626',
  '2026-06-03 14:00:00+03',
  'Dijital Çağda B2B Satınalma Stratejileri 2026 | Tedport',
  'Yapay zeka, veri odaklı karar verme ve dijital platformların B2B satınalmayı nasıl dönüştürdüğünü öğrenin. 2026 dijital tedarik stratejileri rehberi.'
);
