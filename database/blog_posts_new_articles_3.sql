-- Enes Doğanay | 27 Haziran 2026: Bilgi Merkezi 3. paket — 10 adet SEO odaklı içerik
-- Kategoriler: İhale Rehberi (5), Satınalma (3), Rehber (2)

INSERT INTO blog_posts (slug, title, summary, content, category, reading_time, cover_color, published_at, seo_title, seo_description) VALUES

-- ─────────────────────────────────────────────────────────────────
-- 1. Dövizli İhale ve Kur Riski Yönetimi | İhale Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'dovizli-ihale-kur-riski-yonetimi',
  'Dövizli İhale ve Kur Riski: Teklifinizi Nasıl Korursunuz?',
  'TL mi, döviz mi? Kur dalgalanmalarına karşı ihale tekliflerinizi nasıl yapılandıracağınızı, fiyat farkı formüllerini ve sözleşmeye eklenmesi gereken koruma maddelerini öğrenin.',
  '<h2>Dövizli İhale Neden Bu Kadar Kritik?</h2>
<p>Türkiye''nin köklü kur dalgalanmaları, ihale teklifleri için ciddi bir risk kaynağı oluşturmaktadır. Bir ay önce verdiğiniz TL teklifi, teslim tarihinde hammadde veya enerji maliyetleri yüzde otuz artmışsa derin zarara dönüşebilir. Öte yandan döviz cinsinden teklif vermek alıcı için öngörülemeyen bir maliyet yükü yaratır. İki tarafın da çıkarını koruyabilmek için kur riskini doğru yapılandırmak şarttır.</p>

<h2>TL mi Döviz mi? Karar Kriterleri</h2>
<h3>TL Teklif Vermenin Mantıklı Olduğu Durumlar</h3>
<ul>
  <li>Üretim girdilerinin tamamı yurt içi TL bazlı</li>
  <li>Teslimat süresi 30 günü aşmıyor</li>
  <li>Alıcı kamu kurumu ve dövizli fiyat talep etmiyor</li>
  <li>Sözleşmede fiyat farkı hükmü mevcut</li>
</ul>
<h3>Döviz veya Dövize Endeksli Teklif Vermenin Mantıklı Olduğu Durumlar</h3>
<ul>
  <li>İthal hammadde, enerji veya ekipman kullanılıyor</li>
  <li>Teslimat/hizmet süresi 3 ayı aşıyor</li>
  <li>Proje değeri yüksek ve marj dar</li>
  <li>Alıcı dövizli fiyat kabul ediyor veya talep ediyor</li>
</ul>

<h2>Fiyat Farkı (Eskalasyon) Hükmü Nedir?</h2>
<p>Fiyat farkı hükmü; sözleşme imzalanmasından teslimata kadar geçen sürede oluşan maliyet artışlarının tedarikçiye kısmen veya tamamen yansıtılmasına olanak tanıyan sözleşme maddesidir. Kamu ihalelerinde 4735 sayılı Kamu İhale Sözleşmeleri Kanunu''nun 8. maddesi ve ilgili yönetmelikler bu düzenlemeyi zorunlu kılmaktadır.</p>
<h3>Standart Fiyat Farkı Formülü</h3>
<p>Pek çok kamu ve özel sektör sözleşmesinde kullanılan temel formül şu şekildedir:</p>
<ul>
  <li><strong>F = Bn × (A1/A0 × a1 + A2/A0 × a2 + ... + sabit)</strong></li>
  <li>Bn: Temel fatura bedeli</li>
  <li>A1, A2…: İlgili endeks değerleri (TÜİK, TCMB)</li>
  <li>a1, a2…: İlgili kalem ağırlık katsayıları</li>
</ul>
<p>Uygulamada hammadde, işçilik, enerji ve döviz kuru ayrı ağırlıklarla formüle dahil edilir. Endeks olarak TÜİK''in Üretici Fiyat Endeksi (ÜFE), TCMB dolar/euro kurları veya sektöre özgü endeksler kullanılabilir.</p>

<h2>Sözleşmeye Eklenmesi Gereken Koruma Maddeleri</h2>
<h3>1. Tavan/Taban Kur Tanımı</h3>
<p>Teklif tarihindeki kuru referans alarak belirli bir sapma eşiği (örneğin ±%15) aşılırsa fiyatın otomatik revize edileceğini belirtin. Bu sayede her iki taraf da öngörülemeyen aşırı kur hareketlerine karşı korunur.</p>
<h3>2. Ödeme Para Birimi Seçeneği</h3>
<p>Sözleşmeyi TL üzerinden yazarken alıcının ödeme tarihindeki TCMB döviz satış kuru esas alınarak dövize eşdeğer TL ödeme yapmasına imkân tanıyan madde ekleyin.</p>
<h3>3. Mücbir Sebep ve Olağanüstü Kur Hareketi</h3>
<p>Kur değişiminin belirli eşiği (%30-40 gibi) aşması halinde tarafların sözleşmeyi yeniden müzakere edebileceğini veya feshedebileceğini düzenleyin.</p>
<h3>4. Avans veya Peşin Ödeme</h3>
<p>Uzun vadeli projelerde işin başında alınacak %20-30 oranında avans, tedarikçinin hammadde alımını teklif kurunda yapmasını sağlayarak kur riskini önemli ölçüde azaltır.</p>

<h2>DİİB (Dahilde İşleme İzin Belgesi) ile Kur Avantajı</h2>
<p>İhracat taahhütlü üretim yapan firmalar Dahilde İşleme İzin Belgesi kapsamında yurt içinde gümrüksüz ve KDV''siz ithalat yapabilir. Bu sayede döviz bazlı hammadde maliyetlerini vergisiz karşılamak mümkün olur; ihale teklifini TL bazlı yapıp rekabetçi kalırken kur riskini de minimize edersiniz.</p>

<h2>Pratik Kontrol Listesi</h2>
<ul>
  <li>Teklif geçerlilik süresi kısa tut (30-45 gün), uzun vadeli ihale için tavan fiyat teklifi yapma</li>
  <li>Sözleşmeye mutlaka fiyat farkı hükmü ekle</li>
  <li>Hammadde/ithal ürün oranı yüksekse döviz endeksli teklif ver</li>
  <li>Avans ödemesi talep et; büyük projelerde vazgeçilmez</li>
  <li>TCMB kur verilerini düzenli takip et, teklif tarihini iyi seç</li>
  <li>Kur riskini sigortalatmak için forward döviz sözleşmesi değerlendir</li>
</ul>

<h2>Sonuç</h2>
<p>Kur riski, ihale kazanmanın önünde değil kazandıktan sonra karın erimesinin önündeki engeldir. Doğru yapılandırılmış sözleşme maddeleri ve fiyat farkı formülleri bu riski yönetilebilir kılar. Tedport üzerinde ihale teklifinizi sunarken şartname ekine bu maddeleri mutlaka yükleyin.</p>',
  'İhale Rehberi',
  8,
  '#b45309',
  '2026-06-27 09:00:00+03',
  'Dövizli İhale ve Kur Riski Yönetimi | Tedport Rehber',
  'TL mi döviz mi? Kur dalgalanmalarına karşı ihale tekliflerini nasıl korursunuz? Fiyat farkı formülü, sözleşme maddeleri ve DİİB avantajı hakkında kapsamlı rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 2. Konsorsiyum ve Ortak Girişim | İhale Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'konsorsiyum-ortak-girisim-ihale-rehberi',
  'Konsorsiyum ve Ortak Girişim ile Büyük İhalelere Girin',
  'Tek başınıza yeterli kapasiteye ulaşamıyorsanız ortak girişim veya konsorsiyum kurarak büyük ihalelere katılabilirsiniz. Farkları, nasıl kurulduğu ve dikkat edilmesi gerekenler.',
  '<h2>Neden Ortak Girişim veya Konsorsiyum?</h2>
<p>Büyük ölçekli ihaleler, katılım için yüksek mali yeterlilik, iş deneyimi ve teknik kapasite şartları koşar. Bunları tek başına karşılayamayan KOBİ''ler için ortak girişim ve konsorsiyum modelleri, büyük projelerin kapısını aralayan yasal ve pratik çözümlerdir. 4734 sayılı Kamu İhale Kanunu bu iki modeli açıkça tanımlamakta ve düzenlemektedir.</p>

<h2>Ortak Girişim ile Konsorsiyum Arasındaki Fark</h2>
<table>
  <thead><tr><th>Özellik</th><th>Ortak Girişim (İş Ortaklığı)</th><th>Konsorsiyum</th></tr></thead>
  <tbody>
    <tr><td>İşin bölünmesi</td><td>Tüm ortaklar aynı işi birlikte yapar</td><td>Her ortak kendi bölümünü yapar</td></tr>
    <tr><td>Sorumluluk</td><td>Müteselsil (tam ortak sorumluluk)</td><td>Her ortak kendi kısmından sorumlu</td></tr>
    <tr><td>Yeterlilik değerlendirmesi</td><td>Ortakların toplam yeterlilikleri birleştirilir</td><td>Her ortak kendi üstlendiği kısım için değerlendirilir</td></tr>
    <tr><td>Kullanım alanı</td><td>Bütünleşik yapım, mal veya hizmet alımı</td><td>Farklı uzmanlık gerektiren karma işler</td></tr>
  </tbody>
</table>

<h2>Ortak Girişim Nasıl Kurulur?</h2>
<h3>Adım 1: Pilot Ortağı Belirleyin</h3>
<p>Ortak girişimde tek bir pilot ortak bulunmak zorundadır. Pilot; teklif sürecini yürütür, ihale makamıyla muhatap olur ve sözleşmeyi imzalar. Genellikle en yüksek hisseye sahip ortak bu görevi üstlenir.</p>
<h3>Adım 2: Ortaklık Pay Oranlarını Belirleyin</h3>
<p>Pay oranları net yazılı anlaşmayla belirlenmeli ve ihale şartnamesindeki asgari yeterlilik eşiklerine göre yapılandırılmalıdır. Tipik yapı: pilot ortak %51+, diğer ortaklar kalan payı paylaşır.</p>
<h3>Adım 3: Ortak Girişim Beyannamesi Hazırlayın</h3>
<p>KİK standart formunu (Standart Form KİK027.1/O) doldurun. Bu belgede ortakların isimleri, unvanları, pay oranları ve pilot ortak belirlenir. Teklif zarfıyla birlikte sunulur.</p>
<h3>Adım 4: İhale Sonrası Sözleşme İmzası</h3>
<p>İhale kazanıldığında noterde onaylı ortaklık sözleşmesi imzalanır. Bu sözleşmede kâr/zarar paylaşımı, karar alma mekanizması ve anlaşmazlık çözümü düzenlenmelidir.</p>

<h2>Yeterlilik Koşullarını Birleştirmek</h2>
<p>Kamu ihalelerinde ortak girişimin sunabileceği toplam yeterlilik kapasitesi şu kurallara tabidir:</p>
<ul>
  <li><strong>Mali yeterlilik:</strong> Ortakların yıllık ciroları veya bilanço değerleri toplanabilir</li>
  <li><strong>İş deneyimi:</strong> Pilot ortağın tek başına asgari eşiğin %80''ini sağlaması, diğer ortakların ise bu eşiği tamamlaması beklenir (şartnameye göre değişir)</li>
  <li><strong>Teknik ekipman:</strong> Tüm ortakların makine parkı ve teknik kapasitesi birleştirilebilir</li>
  <li><strong>Personel:</strong> Teknik personel listesi tüm ortaklar adına sunulur</li>
</ul>

<h2>Yaygın Hatalar ve Dikkat Edilecekler</h2>
<ul>
  <li><strong>Pay oranı belirsizliği:</strong> Pay oranları sözleşme aşamasına bırakılmamalı, teklif aşamasında netleştirilmeli</li>
  <li><strong>Kâr paylaşımı yazılı olmalı:</strong> Sözlü mutabakat yeterli değil; ortak girişim sözleşmesine ekleyin</li>
  <li><strong>Vergi yükümlülükleri:</strong> Ortak girişim ayrı vergi mükellefi olabilir; muhasebeci ile önceden görüşün</li>
  <li><strong>İtiraz durumunda koordinasyon:</strong> İhaleye itiraz için tüm ortakların ortak hareket etmesi gerekir</li>
  <li><strong>SGK prim borcu kontrolü:</strong> Her ortağın vergi/SGK borcu bulunmamalı; tek bir ortağın borcu teklifi değerlendirme dışı bırakabilir</li>
</ul>

<h2>Özel Sektör İhalelerinde Ortak Teklif</h2>
<p>Kamu ihalelerindeki gibi yasal bir format olmasa da özel sektörde de ortak teklif mümkündür. Alıcı firmaya yazılı mutabakat mektubu ile her iki firmanın tek teklif vereceği bildirilir. Sözleşme kazanılırsa taraflar arasındaki iç düzenleme özel hukuka tabi olur. Tedport''ta ihale teklifinize bu tür belgeleri ekleyerek ortak teklif sunabilirsiniz.</p>

<h2>Sonuç</h2>
<p>Büyük ihalelerin kapısı tek başına açılmıyorsa ortak girişim veya konsorsiyum doğru anahtardır. Doğru ortak seçimi, net pay dağılımı ve yazılı sözleşme üçlüsü bu modeli başarıya taşıyan temel faktörlerdir.</p>',
  'İhale Rehberi',
  9,
  '#6d28d9',
  '2026-06-28 09:00:00+03',
  'Konsorsiyum ve Ortak Girişim ile Büyük İhalelere Giriş | Tedport Rehber',
  'Ortak girişim ve konsorsiyum arasındaki farklar, nasıl kurulur, yeterlilik şartları nasıl birleştirilir? KOBİ''ler için büyük ihale rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 3. İhale Kaybettikten Sonra Ne Yapmalı | İhale Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'ihale-kaybettikten-sonra-ne-yapmali',
  'İhale Kaybettikten Sonra Yapmanız Gereken 6 Adım',
  'Kaybedilen her ihale bir öğrenme fırsatıdır. Sonuç belgesini almak, değerlendirme puanınızı öğrenmek, rakip analizi yapmak ve bir sonraki ihalede daha güçlü çıkmak için pratik rehber.',
  '<h2>Kaybetmek Bir Son Değil, Başlangıç Noktasıdır</h2>
<p>Türkiye''de her ihaleye ortalama üç ila sekiz firma katılır; dolayısıyla istatistiksel olarak her katılımcı en az birkaç ihaleyi kaybetmek zorundadır. Sorun kaybetmek değil, neden kaybettiğinizi bilmeden aynı hatayı tekrarlamaktır. Bu altı adım, kaybı sistematik bir gelişim sürecine dönüştürmenize yardımcı olacak.</p>

<h2>Adım 1: Sonuç Belgesini ve Değerlendirme Raporunu Talep Edin</h2>
<p>Kamu ihalelerinde ihale sonucu EKAP üzerinden yayımlanır ve başvurucu firmalar gerekçeli değerlendirme raporunu talep hakkına sahiptir. Özel sektör ihalelerinde ise alıcıya yazılı geri bildirim talep maili atın. Çoğu kurumsal alıcı teklifin hangi kriterde eksik kaldığını paylaşır; bu bilgi paha biçilmezdir.</p>
<p>Talep ederken şu soruları netleştirin:</p>
<ul>
  <li>Hangi değerlendirme kriterinde kaç puan aldım?</li>
  <li>Kazanan teklifin fiyatı neydi?</li>
  <li>Teknik değerlendirmeden elendiysem hangi belgem eksikti?</li>
</ul>

<h2>Adım 2: Fiyat Farkını Analiz Edin</h2>
<p>Teklifiniz fiyat kriteri nedeniyle elendiyse maliyet yapınızı yeniden inceleyin. Ancak fiyatı düşürmek her zaman doğru yanıt değildir. Kazanan rakibin fiyatı maliyet altındaysa ilerde teslimat sorunları yaşanacak demektir; bu durum size bir sonraki aşamada fırsat yaratabilir. Analiz için şu sorularla başlayın:</p>
<ul>
  <li>Hammadde veya tedarikçi değişimi maliyeti gerçekçi biçimde düşürür mü?</li>
  <li>Ölçek ekonomisi fiyatımı nasıl etkiler?</li>
  <li>Genel gider dağılımımı ihale bazında optimize edebilir miyim?</li>
</ul>

<h2>Adım 3: Teknik Eksiklerinizi Kapatın</h2>
<p>Değerlendirme puanınız teknik kısımda düşüldüyse bu eksiklikleri kataloglamalısınız:</p>
<ul>
  <li><strong>Belge eksikliği:</strong> ISO, TSE, CE gibi sertifikaları çıkarın. Bu belgeler birçok ihalede 10-20 puan değerindedir.</li>
  <li><strong>İş deneyimi belgesi:</strong> Tamamladığınız projelerin iş bitirme veya iş durum belgelerini düzenli tutun.</li>
  <li><strong>Teknik personel:</strong> Mühendis veya uzman personel özgeçmişlerini güncelleyin; diplomaları tasdik ettirin.</li>
  <li><strong>Referans mektupları:</strong> Mevcut müşterilerinizden yazılı referans isteyin; değerlendirmelerde ağırlık taşır.</li>
</ul>

<h2>Adım 4: Rakip Profilini Çıkarın</h2>
<p>EKAP üzerinden kamuoyuna açık ihale sonuçlarına bakarak kazanan firmanın genel ihale performansını inceleyebilirsiniz. Hangi sektörlerde aktif? Hangi kapasite ve belgelerle öne çıkıyor? Özel sektörde kazanan rakipler için LinkedIn profilleri, kurumsal web siteleri ve varsa referans listelerine bakın. Bu analiz, pozisyonlamanızı netleştirecektir.</p>

<h2>Adım 5: Teklif Sunum Kalitenizi Artırın</h2>
<p>İçerik yerindeyken sunum kalitesi teklifi farklılaştırır. Değerlendirmeciler onlarca teklifi inceler; düzenli, net ve profesyonel sunum ciddi avantaj sağlar:</p>
<ul>
  <li>İçindekiler tablosu ve bölüm başlıkları ekleyin</li>
  <li>Referans belgelerini özetleyen tek sayfalık profil hazırlayın</li>
  <li>Teknik ve mali teklifi ayrı, düzgün etiketlenmiş dosyalarda sunun</li>
  <li>Kapak sayfasına firma logosu, ihale konusu ve iletişim bilgisi ekleyin</li>
</ul>

<h2>Adım 6: İlişkiyi Canlı Tutun</h2>
<p>Kaybettiğiniz ihalenin alıcısı bir sonraki ihale için potansiyel müşteridir. Kibarca gönderilecek kısa bir "Sonucu not aldık, bir sonraki ihalede görüşmek üzere" maili sizi alıcının zihninde pozitif bırakır. Büyük kurumsal alıcılar yıl boyu ihale açar; ilk ihalede kazanamamak ilişkiyi bitirmez.</p>

<h2>Özet: Kaybı Kazanca Çeviren Döngü</h2>
<ol>
  <li>Sonuç belgesini ve puanlamayı al</li>
  <li>Fiyat farkını analiz et — düşürmek her zaman yanıt değil</li>
  <li>Teknik belge ve sertifika eksiklerini kapat</li>
  <li>Kazanan rakibin profilini çıkar</li>
  <li>Teklif sunumunun kalitesini artır</li>
  <li>Alıcıyla ilişkiyi sıcak tut</li>
</ol>
<p>Bu döngüyü her ihale sonrası tekrarlayan firmalar, zaman içinde kazanma oranlarını belirgin biçimde artırmaktadır. Tedport''taki ihale geçmişinizi kullanarak hangi kategorilerde daha rekabetçi olduğunuzu analiz edebilirsiniz.</p>',
  'İhale Rehberi',
  6,
  '#dc2626',
  '2026-06-29 09:00:00+03',
  'İhale Kaybettikten Sonra Yapmanız Gereken 6 Adım | Tedport',
  'İhale kaybettikten sonra nasıl analiz yapılır, teknik eksikler nasıl kapatılır, rakip nasıl incelenir? Bir sonraki ihalede daha güçlü çıkmak için pratik rehber.'
),

-- ─────────────────────────────────────────────────────────────────
-- 4. Ön Piyasa Araştırması | İhale Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'on-piyasa-arastirmasi-nedir-nasil-yapilir',
  'Ön Piyasa Araştırması Nedir? Yaklaşık Maliyet Belirleme Rehberi',
  '4734 sayılı KİK''e göre ihale öncesi ön piyasa araştırması zorunludur. Piyasa fiyatlarını doğru tespit etmek, gerçekçi yaklaşık maliyet oluşturmak ve ihale sürecini sağlıklı başlatmak için adım adım rehber.',
  '<h2>Ön Piyasa Araştırması Nedir?</h2>
<p>Ön piyasa araştırması; bir ihaleyi açmadan önce alıcı kurumun ihtiyaç duyduğu mal, hizmet veya yapım işinin piyasadaki güncel fiyatını, tedarik koşullarını ve mevcut tedarikçi havuzunu araştırması sürecidir. Bu araştırmanın temel amacı, ihaleye esas olacak <strong>yaklaşık maliyeti</strong> gerçekçi biçimde belirlemektir.</p>
<p>4734 sayılı Kamu İhale Kanunu''nun 9. maddesi; ihale öncesinde piyasada oluşan fiyatların araştırılmasını ve buna dayanarak yaklaşık maliyetin hesaplanmasını zorunlu kılmaktadır. Yeterli araştırma yapılmadan hazırlanan yaklaşık maliyet ya gelen teklifleri sıfırlamakta ya da kamu zararına zemin hazırlamaktadır.</p>

<h2>Ön Piyasa Araştırmasının Önemi</h2>
<ul>
  <li><strong>Gerçekçi bütçe:</strong> Piyasa fiyatından kopuk yaklaşık maliyet, ihaleye geçerli teklif gelmemesine veya aşırı düşük teklif sorununa yol açar.</li>
  <li><strong>Rekabet ortamı:</strong> Piyasadaki tedarikçi sayısını ve kapasitelerini önceden bilmek ihale modelini doğru seçmeye yardımcı olur.</li>
  <li><strong>Şartname kalitesi:</strong> Piyasayla temas, teknik şartnameyi güncel standartlara uygun yazmanızı sağlar.</li>
  <li><strong>İtiraz riski:</strong> Gerçekçi olmayan yaklaşık maliyet, itiraz ve dava süreçlerinin tetikleyicisi olabilir.</li>
</ul>

<h2>Araştırma Yöntemleri</h2>
<h3>1. Yazılı Fiyat Teklifi Toplama</h3>
<p>İhtiyaca uygun en az üç firmaya yazılı bilgi ve fiyat teklifi formu gönderin. Formda; ürün/hizmet açıklaması, teknik özellikler, miktar ve tahmini teslimat tarihi yer almalıdır. Gelen teklifleri karşılaştırarak piyasa fiyatı aralığını belirleyin.</p>
<h3>2. Kamu Fiyat Listelerinden Yararlanma</h3>
<p>Yapım işlerinde Çevre ve Şehircilik Bakanlığı''nın yayımladığı <strong>Birim Fiyat Analizleri ve Birim Fiyat Tarifleri</strong>, mal ve hizmet alımlarında ise kamu kurumlarınca yayımlanan referans fiyat listeleri kullanılabilir.</p>
<h3>3. Geçmiş İhale Sonuçları</h3>
<p>EKAP üzerinden benzer ihalelerde oluşan teklif ve sözleşme fiyatlarına bakın. Piyasa trendini ve fiyat dağılımını anlayabilirsiniz.</p>
<h3>4. Katalog ve Liste Fiyatları</h3>
<p>Ürün bazlı alımlarda tedarikçi katalog fiyatları, perakende fiyat endeksleri ve uluslararası borsalar referans alınabilir (demir, bakır, alüminyum gibi hammaddeler için LME fiyatları).</p>
<h3>5. Uzman Görüşü</h3>
<p>Teknik uzmanlık gerektiren işlerde bağımsız mühendis veya danışman görüşü alın; bu görüş yazılı olarak dosyaya eklenmelidir.</p>

<h2>Yaklaşık Maliyet Hesaplama Formu</h2>
<p>Araştırma tamamlandıktan sonra standart yaklaşık maliyet hesap cetveli doldurulur. Bu cetvelde her bir kalem için:</p>
<ul>
  <li>Birimi (adet, kg, m², saat vb.)</li>
  <li>Miktarı</li>
  <li>Birim fiyatı (araştırma sonucu oluşan piyasa ortalaması veya en uygun fiyat)</li>
  <li>KDV hariç toplam tutarı</li>
  <li>Fiyatın kaynağı (hangi firmadan, hangi tarihte alındığı)</li>
</ul>
<p>yer almalıdır. Hesap cetveli ve dayanak belgeler ihale dosyasına konulur, onay makamına sunulur.</p>

<h2>Yaklaşık Maliyeti Saklı Tutma Zorunluluğu</h2>
<p>Kamu ihalelerinde yaklaşık maliyet ihale sonuçlanana kadar gizlidir. Üçüncü kişilere açıklanması disiplin suçu oluşturabileceği gibi cezai sorumluluk da doğurabilir. Özel sektörde bu zorunluluk yasal değilse de bütçe bilgisinin önceden sızması rekabeti ortadan kaldırır.</p>

<h2>Sık Yapılan Hatalar</h2>
<ul>
  <li>Tek firmadan fiyat alıp bunu piyasa fiyatı saymak</li>
  <li>Araştırmayı ihale açılışından çok önce yapıp fiyatların güncellenmesini göz ardı etmek</li>
  <li>KDV dahil/hariç fiyatları karıştırmak</li>
  <li>Nakliye, montaj ve sigorta gibi yan maliyetleri yaklaşık maliyete dahil etmemek</li>
  <li>Formu imzalatmadan dosyaya koymak</li>
</ul>

<h2>Tedport ile Piyasa Araştırmanızı Hızlandırın</h2>
<p>Tedport''ta kayıtlı tedarikçi firmalar arasında sektör ve kategori bazlı arama yaparak ön piyasa araştırmanız için doğru firmalara kolayca ulaşabilirsiniz. İhale öncesi bilgi/fiyat teklifi talebi için platform üzerinden doğrudan mesaj gönderin.</p>',
  'İhale Rehberi',
  7,
  '#065f46',
  '2026-06-30 09:00:00+03',
  'Ön Piyasa Araştırması Nedir? Yaklaşık Maliyet Rehberi | Tedport',
  '4734 sayılı KİK kapsamında ön piyasa araştırması nasıl yapılır, yaklaşık maliyet nasıl hesaplanır? Alıcılar için adım adım kamu ihale rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 5. İnşaat Sektöründe İhale | İhale Rehberi
-- ─────────────────────────────────────────────────────────────────
(
  'insaat-sektorunde-ihale-yapirim-rehberi',
  'İnşaat Sektöründe İhale: Metraj, Yaklaşık Maliyet ve Yapım İhalesi Rehberi',
  'Türkiye''deki ihale hacminin büyük bölümünü oluşturan yapım ihalelerinde metraj, keşif, birim fiyat ve teknik şartname hazırlamak zorunda kalan alıcı ve tedarikçiler için kapsamlı rehber.',
  '<h2>Yapım İhalesi Nedir?</h2>
<p>Yapım ihalesi; bina, altyapı, karayolu, baraj, tesisat veya benzeri inşaat işlerinin ihale yoluyla yaptırılması sürecidir. 4734 sayılı Kanun kapsamındaki kamu yapım ihaleleri, mal ve hizmet alımlarına göre daha karmaşık bir belge ve değerlendirme sürecine sahiptir. Türkiye''de yıllık kamu yapım ihalelerinin hacmi toplam kamu ihale bütçesinin yaklaşık yüzde kırkını oluşturmaktadır.</p>

<h2>Yaklaşık Maliyet ve Keşif Belgesi</h2>
<p>Yapım ihalelerinde yaklaşık maliyet <strong>keşif belgesi</strong> aracılığıyla hesaplanır. Keşif belgesi; yapılacak işin tüm imalat kalemlerini, miktarlarını ve birim fiyatlarını içeren ayrıntılı cetveldir.</p>
<h3>Keşif Belgesi Nasıl Hazırlanır?</h3>
<ol>
  <li><strong>Metraj Çıkarmak:</strong> Mimari, statik ve mekanik projelerden her imalat kalemi için miktar hesabı yapılır. Metraj; uzunluk, alan, hacim veya adet cinsinden çıkarılır. Hatalı metraj, ihalenin en önemli anlaşmazlık kaynağıdır.</li>
  <li><strong>Pozlar ve Birim Fiyatlar:</strong> Çevre ve Şehircilik Bakanlığı her yıl güncel birim fiyat tariflerini yayımlar. Her imalat kalemi bu tarifedeki poza karşılık getirilir; poz bulunamaması halinde analiz yöntemiyle yeni fiyat oluşturulur.</li>
  <li><strong>Keşif Cetvelini Oluşturmak:</strong> Pozlar, miktarlar ve birim fiyatlar bir arada cetvelleştirilir; toplam KDV hariç tutar yaklaşık maliyeti verir.</li>
</ol>

<h2>Teknik Şartname (Özel Teknik Şartname)</h2>
<p>Bakanlık standart teknik şartnameleri genel nitelik taşır. Projeye özgü malzeme standartları, imalat kalitesi ve kabul kriterleri için <strong>özel teknik şartname</strong> hazırlanmalıdır:</p>
<ul>
  <li>Kullanılacak malzeme sınıfı ve markaları (veya muadillerinin nitelikleri)</li>
  <li>İşçilik standartları ve deneyim gereklilikleri</li>
  <li>Test ve muayene prosedürleri</li>
  <li>Çevre ve iş güvenliği önlemleri</li>
</ul>

<h2>Yapım İhalelerinde Yeterlilik Şartları</h2>
<h3>İş Deneyim Belgesi</h3>
<p>Yapım ihalelerinin en kritik yeterlilik belgesi iş deneyimidir. Şartname, benzer iş tanımını ve asgari tutarı belirler. Firmalar tamamladıkları işlerden iş bitirme, iş durum veya iş denetleme belgesi alarak yeterliliklerini kanıtlar.</p>
<h3>Teknik Personel</h3>
<p>Şartnameye göre en az mühendis sayısı ve deneyim süresi tanımlanır. Personelin özgeçmişleri, diploma tasdikleri ve SGK primine esas hizmet cetvelleri sunulmalıdır.</p>
<h3>Makine Parkı</h3>
<p>Büyük yapım işlerinde taahhüt edilecek ekipman listesi (iş makineleri, taşıt, ölçüm cihazları) şartnameye eklenir. Kira veya kullanım hakkına dayalı ekipman da kabul görebilir; şartnameyi dikkatle inceleyin.</p>

<h2>Yapım İhalesinde Teklif Hazırlamanın İncelikleri</h2>
<ul>
  <li><strong>Saha Keşfi Zorunlu:</strong> İhale öncesi sahayı bizzat ziyaret edin. Zemin koşulları, ulaşım güçlükleri ve mevcut altyapı teklif fiyatını doğrudan etkiler.</li>
  <li><strong>Şantiye Giderleri:</strong> Şantiye kurulum, genel gider ve kâr bedelini ayrıca hesaba katın. Birim fiyat analizine dahil edilmeyen bu kalemler zarar riskini artırır.</li>
  <li><strong>Fiyat Farkı Hükmü:</strong> Uzun soluklu yapım işlerinde mutlaka fiyat farkı hükmü olan ihalelere katılmayı tercih edin. Aksi hâlde enflasyon ve kur artışı kârı yok eder.</li>
  <li><strong>Süre Analizi:</strong> İş programını (CPM/Gantt) hazırlayın ve teklif sürenizi bu analize dayandırın. Çok kısa süre taahhüdü ceza riskini artırır.</li>
</ul>

<h2>Hakediş Süreci</h2>
<p>Yapım işlerinde ödeme hakediş yöntemiyle yapılır. Ayda bir (veya şartnamede belirlenen dönemde) yüklenici o ana kadar tamamlanan imalatları belgeler ve hakediş raporu düzenler. İdarenin onayının ardından ödeme yapılır. Hakediş reddine karşı itiraz hakkı mevcuttur.</p>

<h2>Sonuç</h2>
<p>İnşaat sektöründe ihale; teknik derinlik, belge yönetimi ve saha gerçekliğini bir arada yönetmeyi gerektiren zorlu ama kârlı bir alandır. Metrajdan hakediş aşamasına kadar her adımda dikkatli belgeleme yapmak hem itiraz riskini hem de sözleşme anlaşmazlıklarını önler.</p>',
  'İhale Rehberi',
  9,
  '#92400e',
  '2026-07-01 09:00:00+03',
  'İnşaat Sektöründe İhale: Metraj ve Yapım İhalesi Rehberi | Tedport',
  'Yapım ihalelerinde keşif belgesi, metraj, birim fiyat, yeterlilik şartları ve hakediş süreci. İnşaat sektörü için kapsamlı ihale rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 6. Yeşil Satınalma ve Sürdürülebilir Tedarik | Satınalma
-- ─────────────────────────────────────────────────────────────────
(
  'yesil-satinalma-surdurulebilir-tedarik',
  'Yeşil Satınalma ve Sürdürülebilir Tedarik Zinciri: 2026 Rehberi',
  'ESG uyum, yeşil tedarikçi kriterleri ve karbon ayak izi azaltma artık tercih değil zorunluluk. Kurumsal alıcılar için sürdürülebilir satınalma rehberi.',
  '<h2>Neden Sürdürülebilir Satınalma?</h2>
<p>2026 itibarıyla Avrupa Birliği''nin Kurumsal Sürdürülebilirlik Raporlama Yönergesi (CSRD) ve Karbon Sınır Düzenleme Mekanizması (CBAM), Türk tedarikçilerini ve alıcılarını doğrudan etkiler hale gelmiştir. AB''ye ihracat yapan veya AB menşeli firmalarla çalışan her işletme, tedarik zincirinde karbon izini belgeleme baskısıyla karşı karşıyadır. Buna ek olarak, kurumsal yatırımcılar ve büyük alıcılar ESG (Çevresel, Sosyal, Yönetişim) puanlarını tedarikçi seçiminde giderek daha belirleyici bir kriter olarak kullanmaktadır.</p>

<h2>Yeşil Satınalmanın Temel İlkeleri</h2>
<h3>1. Çevresel Etki Değerlendirmesi</h3>
<p>Her tedarik kategorisinde çevresel etki kırılımını yapın: enerji tüketimi, su kullanımı, atık üretimi ve karbondioksit salımı. Bu analiz, hangi kategoride sürdürülebilir alternatiflerin en yüksek getiriyi sağlayacağını gösterir.</p>
<h3>2. Yeşil Ürün Kriterleri</h3>
<ul>
  <li>Geri dönüştürülmüş veya geri dönüştürülebilir içerik</li>
  <li>Enerji verimliliği sertifikaları (Energy Star, A+++ vb.)</li>
  <li>Zararlı kimyasal içermeme (REACH, RoHS uyumu)</li>
  <li>Ambalaj minimizasyonu ve biyobozunur ambalaj</li>
  <li>Ürün yaşam döngüsü uzunluğu</li>
</ul>
<h3>3. Tedarikçi ESG Değerlendirmesi</h3>
<p>Tedarikçi seçiminde fiyat ve kalite kriterlerinin yanına ESG puanlama ekleyin. Bunun için:</p>
<ul>
  <li>Çevre yönetim sistemi belgesi (ISO 14001)</li>
  <li>Enerji yönetim sistemi belgesi (ISO 50001)</li>
  <li>Sosyal sorumluluk belgesi (SA8000)</li>
  <li>Karbon salım beyannamesi veya doğrulanmış karbon ayak izi raporu</li>
  <li>Su ve enerji tüketim raporları</li>
</ul>

<h2>Yeşil Satınalma Politikası Nasıl Oluşturulur?</h2>
<ol>
  <li><strong>Baseline Ölçümü:</strong> Mevcut tedarik zincirinin karbon ayak izini hesaplayın. Scope 3 emisyonları (tedarikçi kaynaklı) toplam kurumsal karbon izinin genellikle %70-80''ini oluşturur.</li>
  <li><strong>Kategori Önceliklendirme:</strong> En yüksek emisyon veya atık üreten kategorileri tespit edin ve yeşil alternatifleri bu kategorilerden başlatın.</li>
  <li><strong>Tedarikçi İletişimi:</strong> Tedarikçilerinize yeşil dönüşüm taahhüdünüzü bildirin; süreç için teknik destek ve süre tanıyın.</li>
  <li><strong>Performans Takibi:</strong> Yıllık tedarikçi değerlendirmesine ESG kriterlerini ekleyin. Gelişim gösteremeyen tedarikçileri kademeli olarak alternatiflerle değiştirin.</li>
</ol>

<h2>Yeşil Satınalmanın İş Değeri</h2>
<ul>
  <li><strong>Maliyet tasarrufu:</strong> Enerji verimli ürünler uzun vadede işletme giderlerini düşürür; minimum ambalaj lojistik maliyetini azaltır.</li>
  <li><strong>Düzenleyici uyum:</strong> CBAM gibi AB mekanizmaları nedeniyle yeşil tedarik zinciri, ek karbon vergisi yükünü azaltır.</li>
  <li><strong>Marka değeri:</strong> Sürdürülebilirlik raporları, kurumsal itibarı ve büyük alıcıların yeterlilik kriterlerini olumlu etkiler.</li>
  <li><strong>Tedarik riski azalımı:</strong> Tek hammaddeye veya fosil yakıta bağımlılığın azalması, tedarik zinciri kırılganlığını düşürür.</li>
</ul>

<h2>Başlangıç için Pratik Adımlar</h2>
<ul>
  <li>En büyük üç tedarik kategorinizden birinde çevresel kriter eklemeye başlayın</li>
  <li>Yeni tedarikçi onboarding formuna ISO 14001 sorusu ekleyin</li>
  <li>Sözleşmelere çevresel performans taahhüt maddesi koyun</li>
  <li>Karbon ayak izi hesaplamak için ücretsiz araçları kullanın (GHG Protocol hesap makineleri)</li>
</ul>

<h2>Sonuç</h2>
<p>Yeşil satınalma artık öncü firmaların niş tercihi değil, AB pazarına entegre her B2B firmanın yakın vadede karşılaşacağı gerçektir. Şimdi başlamak hem düzenleyici baskıya hazırlık hem de tedarik zinciri verimliliği açısından avantaj sağlar.</p>',
  'Satınalma',
  7,
  '#15803d',
  '2026-07-02 09:00:00+03',
  'Yeşil Satınalma ve Sürdürülebilir Tedarik Zinciri Rehberi | Tedport',
  'ESG uyum, yeşil tedarikçi kriterleri, karbon ayak izi azaltma ve ISO 14001. B2B firmalar için 2026 sürdürülebilir satınalma rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 7. Çerçeve Sözleşme | Satınalma
-- ─────────────────────────────────────────────────────────────────
(
  'cerceve-sozlesme-nedir-tekrarlayan-alimlar',
  'Çerçeve Sözleşme Nedir? Tekrarlayan Alımları Kolaylaştırın',
  'Her seferinde yeniden ihale açmak yerine yıllık çerçeve anlaşma yapmanın avantajları, nasıl kurulduğu, kamu ve özel sektör uygulamaları ile dikkat edilmesi gerekenler.',
  '<h2>Çerçeve Sözleşme Nedir?</h2>
<p>Çerçeve sözleşme (framework agreement); alıcı ile bir ya da birden fazla tedarikçi arasında, belirli bir süre boyunca yapılacak alımların genel koşullarını önceden belirleyen çatı bir anlaşmadır. Miktar ve teslimat zamanlaması önceden kesin biçimde belirlenmez; bunun yerine fiyat, kalite standardı, teslimat koşulları ve ödeme yöntemi önceden sabitlenir. İhtiyaç doğduğunda çerçeve kapsamında <strong>siparişe dayalı mini sözleşmeler</strong> devreye girer.</p>

<h2>Kamu ve Özel Sektördeki Yasal Dayanağı</h2>
<p>4734 sayılı Kamu İhale Kanunu''nun 4/ı maddesi çerçeve anlaşmayı tanımlamakta; 4734 Kamu İhale Genel Tebliği ve ilgili yönetmelikler uygulama kurallarını düzenlemektedir. Kamu kurumları çerçeve anlaşmayla en fazla dört yıl için sözleşme yapabilir. Özel sektörde yasal süre sınırı bulunmamakla birlikte, uygulamada bir ila üç yıllık süreler yaygındır.</p>

<h2>Çerçeve Sözleşmenin Avantajları</h2>
<h3>Alıcı Açısından</h3>
<ul>
  <li><strong>Zaman tasarrufu:</strong> Her alım için ayrı ihale süreci yürütmek yerine tek onaylanmış kaynaktan hızla sipariş verilir.</li>
  <li><strong>Fiyat istikrarı:</strong> Kur dalgalanmalarına ve hammadde şoklarına karşı sözleşme dönemi boyunca sabit veya formüle bağlı fiyat güvencesi sağlanır.</li>
  <li><strong>Tedarikçi güvencesi:</strong> Onaylı, denetlenmiş tedarikçiden çalışmak kalite tutarsızlığı riskini azaltır.</li>
  <li><strong>İdari yük azalımı:</strong> Satınalma ekibi tekrar eden ihale hazırlığı yerine stratejik işlere odaklanır.</li>
</ul>
<h3>Tedarikçi Açısından</h3>
<ul>
  <li><strong>Öngörülebilir sipariş akışı:</strong> Üretim ve stok planlaması kolaylaşır; atıl kapasite riski azalır.</li>
  <li><strong>Uzun vadeli ilişki:</strong> Alıcının alternatiflere yönelme olasılığı düşer; ilişki derinleşir.</li>
  <li><strong>Düşük teklif maliyeti:</strong> Her seferinde ihaleye girmek yerine siparişleri otomatik almak satış maliyetini düşürür.</li>
</ul>

<h2>Çerçeve Sözleşme Nasıl Kurulur?</h2>
<h3>1. Kapsam Belirleme</h3>
<p>Hangi ürün veya hizmet kategorileri dahil edilecek? Tahmini yıllık hacim nedir? Kapsam çok geniş tutulursa sözleşme esnek yönetilemez; çok dar tutulursa avantaj azalır.</p>
<h3>2. Tedarikçi Sayısını Belirleme</h3>
<p>Tek tedarikçi veya çok tedarikçili (3-5 firma) model arasında tercih yapın. Çok tedarikçili model; acil durumlarda esneklik ve mini rekabet imkânı sağlar ancak yönetimi daha karmaşıktır.</p>
<h3>3. Fiyat ve Revizyon Mekanizması</h3>
<p>Fiyatlar nasıl güncellenecek? Altı ayda bir endekse göre otomatik güncelleme mi, yoksa yıllık karşılıklı müzakere mi? Revizyon mekanizmasını sözleşmeye net yazın.</p>
<h3>4. Minimum/Maksimum Miktar Taahhüdü</h3>
<p>Alıcı olarak belirli bir minimum taahhüt verecekseniz bunun koşullarını belirtin. Taahhütsüz çerçeve anlaşmada tedarikçi minimum sipariş garantisi olmadan stok tutmak istemeyebilir.</p>
<h3>5. Performans Ölçütleri ve Çıkış Maddeleri</h3>
<p>Teslimat süresi ihlali, kalite standardı altı tutarlı performans veya tedarikçinin iflas riski için sözleşme feshi veya tedarikçi değişikliği koşullarını tanımlayın.</p>

<h2>Ne Zaman Kullanılmamalı?</h2>
<ul>
  <li>İhtiyaç belirsiz, spesifikasyon henüz netleşmemişse</li>
  <li>Piyasada hızla değişen teknoloji veya fiyatlar varsa (her yıl farklı ürün alınıyorsa)</li>
  <li>Hacim çok düşükse (çerçeve kurulum maliyeti getiriyi geçebilir)</li>
</ul>

<h2>Sonuç</h2>
<p>Çerçeve sözleşme; doğru kategorilerde doğru uygulandığında hem alıcının hem tedarikçinin kazandığı bir model ortaya çıkarır. Düzenli ve tahmin edilebilir alımlarınız varsa çerçeve anlaşmayı değerlendirmenin zamanı gelmiş olabilir.</p>',
  'Satınalma',
  7,
  '#0e7490',
  '2026-07-03 09:00:00+03',
  'Çerçeve Sözleşme Nedir? Tekrarlayan Alımları Kolaylaştırın | Tedport',
  'Çerçeve anlaşma ile tekrarlayan alımları hızlandırın. Kamu ve özel sektör uygulamaları, avantajlar, kurulum adımları ve dikkat edilmesi gerekenler.'
),

-- ─────────────────────────────────────────────────────────────────
-- 8. Hizmet Alımında SLA | Satınalma
-- ─────────────────────────────────────────────────────────────────
(
  'hizmet-aliminda-sla-nedir-nasil-yazilir',
  'Hizmet Alımında SLA Nedir ve Nasıl Yazılır? Pratik Rehber',
  'IT, lojistik, temizlik ve güvenlik gibi hizmet ihalelerinde SLA olmadan sözleşme eksiktir. Hizmet seviyesi anlaşmasının temel metrikleri, ceza maddeleri ve izleme yöntemleri.',
  '<h2>SLA Nedir?</h2>
<p>Hizmet Seviyesi Anlaşması (Service Level Agreement — SLA); bir hizmet sağlayıcının alıcıya sunacağı hizmetin kalite standartlarını, ölçülebilir performans göstergelerini ve bu standartların karşılanmaması durumunda uygulanacak yaptırımları tanımlayan sözleşme belgesidir. SLA olmadan imzalanan bir hizmet sözleşmesi, "kaliteli hizmet vereceğim" söz verip bunun ne demek olduğunu tanımlamamak anlamına gelir.</p>

<h2>SLA''nın Zorunlu Olduğu Hizmet Türleri</h2>
<ul>
  <li><strong>IT ve yazılım hizmetleri:</strong> Sistem erişilebilirliği, arıza müdahale süresi, veri yedekleme periyotları</li>
  <li><strong>Lojistik ve kurye:</strong> Teslimat süresi taahhüdü, hasar oranı, kayıp gönderi prosedürü</li>
  <li><strong>Güvenlik hizmetleri:</strong> Olay müdahale süresi, personel devamsızlık oranı, raporlama sıklığı</li>
  <li><strong>Temizlik hizmetleri:</strong> Periyot sıklığı, kullanılan ürün standartları, şikayet yanıt süresi</li>
  <li><strong>Çağrı merkezi ve destek:</strong> Cevaplama süresi, çözüm oranı, çözüm süresi</li>
  <li><strong>Bakım-onarım:</strong> Planlı bakım periyodu, arıza bildirimi sonrası müdahale süresi (MTTR)</li>
</ul>

<h2>SLA''nın Temel Bileşenleri</h2>
<h3>1. Hizmet Kapsamı</h3>
<p>SLA neyin dahil olduğunu net belirtir. Dahil olmayan hizmetler (kapsam dışı — "out of scope") ayrıca listelenir. Bu bölümü muğlak bırakmak, hizmet sağlayıcının "bunu ben üstlenmedim" demesine zemin hazırlar.</p>
<h3>2. Performans Metrikleri (KPI''lar)</h3>
<p>Metriklerin ölçülebilir ve tartışmasız olması şarttır. Örnekler:</p>
<ul>
  <li><strong>Erişilebilirlik (Uptime):</strong> %99,5 aylık sistem erişilebilirliği = ayda en fazla 3,6 saat kesinti</li>
  <li><strong>Yanıt Süresi (Response Time):</strong> Kritik arıza bildirimi sonrası 2 saat içinde saha teknisyeni</li>
  <li><strong>Çözüm Süresi (Resolution Time):</strong> Yüksek öncelikli biletler 4 saat içinde kapatılacak</li>
  <li><strong>Teslimat Başarı Oranı:</strong> Aylık gönderi hacminin %98,5''i taahhüt günü teslim edilecek</li>
  <li><strong>Müşteri Memnuniyeti:</strong> Aylık anket skoru en az 4/5 olacak</li>
</ul>
<h3>3. Öncelik Seviyeleri</h3>
<p>Her hizmet talebi veya arıza aynı öncelikte değildir. Tipik sınıflandırma:</p>
<ul>
  <li><strong>P1 — Kritik:</strong> İş durumu (production down). Yanıt: 15 dk, Çözüm: 2 sa</li>
  <li><strong>P2 — Yüksek:</strong> Önemli işlev bozulmuş. Yanıt: 1 sa, Çözüm: 8 sa</li>
  <li><strong>P3 — Orta:</strong> Kısmi etki. Yanıt: 4 sa, Çözüm: 24 sa</li>
  <li><strong>P4 — Düşük:</strong> Kozmetik/yavaşlık. Yanıt: 1 iş günü, Çözüm: 5 iş günü</li>
</ul>
<h3>4. Ceza Mekanizması (SLA Kredisi)</h3>
<p>Taahhüt tutturulamazsa ne olur? Ceza mekanizması SLA''yı ciddiye alınabilir kılan unsurdur:</p>
<ul>
  <li>Uptime %99,5 altına düşerse her 0,1 puan için fatura bedelinin %2''si kredi</li>
  <li>Teslimat oranı üç ay üst üste %97''nin altında kalırsa sözleşme yenilenmeyebilir</li>
  <li>Ceza toplamı aylık fatura bedelinin %20''sini geçemez (tavan maddesi)</li>
</ul>
<h3>5. Raporlama ve İzleme</h3>
<p>SLA metrikleri kimin, nasıl ve ne sıklıkla ölçeceği belirtilmeli. Aylık performans raporu hizmet sağlayıcı tarafından sunulacak mı? Alıcı kendi izleme araçlarını kullanabilecek mi? Veri erişimi sözleşmeye yazılmalı.</p>

<h2>SLA Yazarken Yapılan Yaygın Hatalar</h2>
<ul>
  <li>Metrikleri subjektif yazmak: "hızlı yanıt" yerine "30 dakika içinde yanıt" yazın</li>
  <li>Kapsam dışını tanımlamamak: "altyapı bakımı dahildir" mi, "sunucu odası bakımı dahil mi?" — netleştirin</li>
  <li>Ölçüm yönteminde anlaşmazlık: iki tarafın farklı araçla ölçüm yapması çelişkili veri üretir; tek kayıt sistemi belirleyin</li>
  <li>Ceza mekanizması olmadan SLA yazmak: yaptırımsız SLA işlevsizdir</li>
  <li>Force majeure''ü çok geniş tanımlamak: bu madde hizmet sağlayıcının her arızayı gerekçe göstermesine zemin hazırlar</li>
</ul>

<h2>Sonuç</h2>
<p>İyi yazılmış bir SLA hem hizmet sağlayıcıyı disipline eder hem de alıcıya performans takibi için nesnel zemin sağlar. Sözleşme imzalamadan önce her hizmet kategorisi için SLA bileşenlerini tek tek gözden geçirin.</p>',
  'Satınalma',
  7,
  '#7c3aed',
  '2026-07-04 09:00:00+03',
  'Hizmet Alımında SLA Nedir ve Nasıl Yazılır? | Tedport Rehber',
  'Hizmet seviyesi anlaşması (SLA) nedir, hangi metrikler kullanılır, ceza mekanizması nasıl yazılır? IT, lojistik ve hizmet ihaleleri için pratik SLA rehberi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 9. Firma Profilinizi İhale Kazanacak Şekilde Hazırlama | Rehber
-- ─────────────────────────────────────────────────────────────────
(
  'ihale-icin-firma-profili-nasil-hazirlanir',
  'İhale Kazanmak İçin Firma Profilinizi Nasıl Güçlendirirsiniz?',
  'Referans belgesi, kapasite raporu, sertifikalar ve portföy sunumu — değerlendirmecilerin dikkat ettiği detaylar. İhale öncesi firma profilinizi güçlendirmek için pratik adımlar.',
  '<h2>Neden Firma Profili Bu Kadar Önemli?</h2>
<p>İhale değerlendirmelerinde iki firma benzer fiyat ve teknik kapasite sunsa da biri daha kapsamlı ve düzenli bir profil ortaya koyuyorsa seçim çoğunlukla o firmadan yana sonuçlanır. Değerlendirmeci, tanımadığı bir firmaya güven duyabilmek için net ve doğrulanabilir bilgiye ihtiyaç duyar. Güçlü bir firma profili bu güven inşa sürecini hızlandırır.</p>

<h2>Temel Profil Bileşenleri</h2>
<h3>1. İş Deneyim Belgeleri</h3>
<p>İş deneyimi, pek çok ihale değerlendirmesinde en ağır kriterdir. Profesyonel iş deneyim belgesi dosyası şunları içermelidir:</p>
<ul>
  <li>Tamamlanan projelerin iş bitirme veya iş durum belgeleri (noter tasdikli suretler)</li>
  <li>Proje adı, kapsamı, bedeli ve tamamlanma tarihi özeti</li>
  <li>Benzer iş kategorisini net gösteren proje sınıflandırması</li>
  <li>Her projeye ait alıcı iletişim bilgisi (referans kontrolü için)</li>
</ul>
<h3>2. Kapasite Raporu</h3>
<p>Teknik kapasitenizi kanıtlamak için:</p>
<ul>
  <li>Makine parkı ve ekipman listesi (marka, model, yaş, kapasite)</li>
  <li>Üretim alanı ve aylık üretim kapasitesi</li>
  <li>Çalışan sayısı ve uzmanlık dağılımı</li>
  <li>Kapasite kullanım oranı — müstakbel alıcıya siparişinizi karşılayabileceklerini gösterin</li>
</ul>
<h3>3. Kalite ve Sektör Sertifikaları</h3>
<p>Her sertifika değerlendirme puanı demektir:</p>
<ul>
  <li>ISO 9001 — kalite yönetim sistemi (hemen her sektörde etkili)</li>
  <li>ISO 14001 — çevre yönetim sistemi</li>
  <li>OHSAS 18001 / ISO 45001 — iş sağlığı ve güvenliği</li>
  <li>CE işareti — AB pazarına yönelik ürünlerde zorunlu</li>
  <li>TSE kalite belgesi</li>
  <li>Sektöre özel belgeler: FSSC 22000 (gıda), IATF 16949 (otomotiv), EN 9100 (havacılık) vb.</li>
</ul>
<p>Sertifika almak zaman ve maliyet gerektirir. Hangisine öncelik vermeniz gerektiğini hedeflediğiniz ihaleler ve alıcı sektörlere göre belirleyin.</p>
<h3>4. Mali Güvenilirlik Kanıtı</h3>
<ul>
  <li>Son üç yılın YMM/SMMM onaylı bilanço ve gelir tabloları</li>
  <li>Banka referans mektubu (büyük ihaleler için)</li>
  <li>Vergi ve SGK borcu bulunmadığına dair güncel belgeler</li>
</ul>
<h3>5. Referans Portföyü</h3>
<p>Çalıştığınız firmalar arasında tanınan markalar varsa bunları öne çıkarın. Referans listesi; firma adı, proje konusu, yıl ve mümkünse iletişim bilgisini içermelidir. Referans firmanızın yazılı olarak onayladığı referans mektubu varsa mutlaka ekleyin.</p>

<h2>Tedport Profil Optimizasyonu</h2>
<p>Tedport''taki firma profilinizde şu başlıklara özel dikkat gösterin:</p>
<ul>
  <li><strong>Firma tanıtım metni:</strong> Ne yaptığınızı, hangi sektörlere hizmet verdiğinizi ve öne çıkan yetkinliklerinizi 2-3 paragrafta net yazın. Klişe ifadelerden kaçının.</li>
  <li><strong>Sektör ve kategori etiketleri:</strong> Doğru etiketler potansiyel alıcıların sizi bulmasını sağlar.</li>
  <li><strong>Sertifika yüklemeleri:</strong> Onaylı sertifikaları güncel tutun; süresi geçmiş belge güven zedeleyebilir.</li>
  <li><strong>Logo ve görsel kimlik:</strong> Profesyonel logo değerlendirmecinin algısını olumlu etkiler.</li>
  <li><strong>Eleman firma rozeti:</strong> Varsa alıcıların güvenini artıran doğrulanmış rozetleri edinin.</li>
</ul>

<h2>İhale Teklif Dosyasında Profili Kullanmak</h2>
<p>Her ihalede şartnameyi okuyun ve hangi profil bilgisinin öne çıkarılacağını belirleyin. Şablonlu teklif değil, her ihaleye özel uyarlanmış profil özeti hazırlayın. Değerlendirmecinin "bu firma tam olarak ihtiyacımıza uygun" demesini sağlayacak bağlantıyı kurun.</p>

<h2>Özet Kontrol Listesi</h2>
<ul>
  <li>İş deneyim belgeleri güncel ve tasdikli mi?</li>
  <li>En az bir uluslararası kalite sertifikası var mı?</li>
  <li>Bilanço ve gelir tabloları son 3 yılı kapsıyor mu?</li>
  <li>Referans listesi ve mektupları hazır mı?</li>
  <li>Tedport profili eksiksiz ve güncel mi?</li>
</ul>',
  'Rehber',
  6,
  '#d97706',
  '2026-07-05 09:00:00+03',
  'İhale Kazanmak İçin Firma Profilinizi Nasıl Güçlendirirsiniz? | Tedport',
  'Referans belgesi, kapasite raporu, kalite sertifikaları ve portföy sunumu ile firma profilinizi ihale değerlendirmelerinde öne çıkarın. Pratik kontrol listesi.'
),

-- ─────────────────────────────────────────────────────────────────
-- 10. Lojistik ve Nakliye İhalesi Rehberi | Rehber
-- ─────────────────────────────────────────────────────────────────
(
  'lojistik-nakliye-ihalesi-rehberi',
  'Lojistik ve Nakliye İhalesi: Alıcılar ve Tedarikçiler İçin Kapsamlı Rehber',
  'Taşıma ihalelerinde akaryakıt fiyat farkı, GPS takip şartı, sorumluluk sigortası ve fiyatlandırma modelleri. Hem nakliye firmaları hem kurumsal alıcılar için pratik rehber.',
  '<h2>Lojistik İhalesi Neden Farklıdır?</h2>
<p>Nakliye ve lojistik hizmet ihaleleri; sabit ürün alımına kıyasla çok daha dinamik maliyet yapısına sahiptir. Akaryakıt fiyatı, döviz kuru, şoför ücretleri ve araç bakım maliyetleri günlük dalgalanma gösterir. Bu dinamizm hem alıcının hem tedarikçinin beklentilerini sözleşmeye doğru yansıtmasını zorunlu kılar.</p>

<h2>Nakliye İhalesi Türleri</h2>
<h3>Toplu Taşıma (FTL — Full Truck Load)</h3>
<p>Tek bir alıcının yükü aracın tamamını doldurduğu taşıma modelidir. Birim maliyet düşüktür, programlama esnekliği yüksektir. İhale değerlendirmesinde ton/km veya araç başına ücret esas alınır.</p>
<h3>Parsiyel Taşıma (LTL — Less Than Truck Load)</h3>
<p>Birden fazla alıcının yükü aynı araçta birleştirilir. Küçük ve orta hacimli düzensiz göndericiler için uygundur. Konsolidasyon hub''ları üzerinden çalışan nakliye firmalarının rekabetçi olduğu alandır.</p>
<h3>Dağıtım Hizmetleri</h3>
<p>Depo veya hub''dan son noktaya teslimat (last mile) ihaleleri. Adres başına maliyet, günlük durak sayısı ve teslimat penceresi gibi metrikler değerlendirme kriterini oluşturur.</p>
<h3>Proje Nakliyesi</h3>
<p>Ağır ve gabari dışı yük taşıma, endüstriyel ekipman nakliyesi gibi özel ihaleler. Teknik kapasite ve izin belgesi gereklilikleri belirleyicidir.</p>

<h2>Şartnamede Yer Alması Gereken Teknik Kriterler</h2>
<h3>Araç Filosu Gereksinimleri</h3>
<ul>
  <li>Minimum araç yaşı (örneğin 5 yaşını geçmemiş)</li>
  <li>Euro emisyon standardı (Euro 5 veya 6)</li>
  <li>Soğutmalı araç gereksinimi (gıda, ilaç gibi soğuk zincir ihalelerinde)</li>
  <li>Araç kapasitesi (tonaj ve hacim)</li>
</ul>
<h3>GPS ve Filo Takip Sistemi</h3>
<p>Alıcılar genellikle canlı konum takibi, güzergah sapma uyarısı ve sürüş analitiklerini sözleşme kapsamına dahil eder. Nakliye firmasının kullandığı takip sistemine alıcının da erişim sağlayıp sağlayamayacağı net yazılmalıdır.</p>
<h3>Sigorta Kapsamı</h3>
<ul>
  <li>Taşınan mal sigortası (CMR veya iç hat sigorta poliçesi)</li>
  <li>Minimum teminat tutarı (araç başına veya taşıma tutarına göre)</li>
  <li>Hasar prosedürü ve talep süreci</li>
</ul>
<h3>Teslimat Performansı</h3>
<ul>
  <li>Zamanında teslimat oranı taahhüdü (genellikle %97-99)</li>
  <li>Hasar ve kayıp oranı tavanı</li>
  <li>Gecikme bildirimi süresi</li>
</ul>

<h2>Fiyatlandırma Modelleri</h2>
<h3>Sabit Ücretli Model</h3>
<p>Belirli güzergah veya bölge için aylık/yıllık sabit ücret. Hacim tahmini güvenilirken tercih edilir; alıcıya maliyet öngörülebilirliği sağlar.</p>
<h3>Ağırlık/Mesafe Bazlı Fiyatlama</h3>
<p>Ton-km veya araç-km üzerinden hesaplanan değişken ücret. Hacim dalgalansa bile adil fiyatlandırma imkânı sunar.</p>
<h3>Açık Kitap Modeli</h3>
<p>Nakliye firmasının gerçek maliyeti (akaryakıt, sürücü, bakım) artı üzerinde anlaşılan kâr marjı üzerinden fiyat oluşturulur. Uzun vadeli büyük ihalelerde şeffaflık ve güven inşa eder.</p>

<h2>Akaryakıt Fiyat Farkı — Kritik Madde</h2>
<p>Uzun vadeli nakliye sözleşmelerinin en tartışmalı konusu akaryakıt fiyat farkıdır. Yüksek enflasyon dönemlerinde akaryakıt maliyetindeki artış nakliye firmasını ağır zarara uğratabilir. Sözleşmeye şu mekanizmayı ekleyin:</p>
<ul>
  <li>Baz akaryakıt fiyatını sözleşme tarihindeki EPDK pompa fiyatı olarak sabitleyin</li>
  <li>Baz fiyata kıyasla %10 veya daha fazla sapma olduğunda ücrete yansıtılacak formülü tanımlayın</li>
  <li>Revizyon periyodunu belirleyin (aylık veya üç aylık)</li>
</ul>

<h2>Lojistik İhalesine Katılacak Firmalar İçin</h2>
<ul>
  <li>K1, K2 yetki belgelerinizin geçerli ve güncel olduğundan emin olun</li>
  <li>Sigorta poliçenizi ihale teslim tarihinden sonrasını kapsayacak şekilde yenileyin</li>
  <li>Referans listesi için önceki büyük alıcılarınızdan yazılı referans isteyin</li>
  <li>Araç filosu yaş ve teknik özelliklerini şartnameyle kıyaslayın; eksik varsa kiralama alternatifinizi değerlendirin</li>
  <li>Akaryakıt fiyat farkı hükmü olmayan uzun dönemli ihalelere dikkatli katılın</li>
</ul>

<h2>Sonuç</h2>
<p>Nakliye ve lojistik ihalelerinde başarı; doğru fiyatlandırma modelinin seçimi, maliyet değişkenlerinin sözleşmeye güvenli biçimde yansıtılması ve operasyonel yeterliliğin belgelerle kanıtlanmasına bağlıdır. Tedport''ta ilan edilen lojistik ihaleleri için teklif sürecinizi dijital olarak yönetebilirsiniz.</p>',
  'Rehber',
  8,
  '#0369a1',
  '2026-07-06 09:00:00+03',
  'Lojistik ve Nakliye İhalesi Rehberi | Tedport',
  'Taşıma ihalelerinde akaryakıt fiyat farkı, GPS takip şartı, sigorta ve fiyatlandırma modelleri. Nakliye firmaları ve kurumsal alıcılar için kapsamlı rehber.'
);
