-- ═══════════════════════════════════════════════════════════════════════════
-- Tedport Chatbot — Kapsamlı Bilgi Tabanı (61 Q&A + 8 Hızlı Soru)
-- Bu dosya mevcut tüm chatbot verilerini siler ve yeniden yükler.
-- Supabase SQL Editor'da çalıştırın.
-- ═══════════════════════════════════════════════════════════════════════════

truncate table public.chatbot_quick_questions restart identity;
truncate table public.chatbot_qa restart identity;

-- ─── Q&A ────────────────────────────────────────────────────────────────────
insert into public.chatbot_qa (keywords, answer) values

-- ── 1. PLATFORM GENEL ───────────────────────────────────────────────────────
(
  array['tedport', 'nedir', 'platform', 'hakkında', 'ne iş'],
  'Tedport, Türkiye''nin güvenilir B2B tedarik platformudur. Firmalar arası ticareti dijitalleştiriyor; ihale ilanı verme, teklif alma ve firma rehberi hizmetleri sunuyoruz.'
),
(
  array['nasıl çalışır', 'işleyiş', 'sistem', 'çalışma mantığı'],
  'Tedport''ta firmalar ihale açar, diğer firmalar teklif verir. Firma rehberinde yer alarak müşteri bulabilirsiniz. Tüm süreç güvenli dijital ortamda yönetilir.'
),
(
  array['güvenilir', 'güvenli mi', 'doğrulanmış', 'onaylı firma'],
  'Tedport''ta kurumsal hesaplar admin onayından geçer. Tüm veriler şifreli iletimle korunur ve KVKK kapsamında işlenir.'
),
(
  array['sektör', 'hangi sektör', 'endüstri', 'alan', 'kategori'],
  'Tedport; inşaat, üretim, lojistik, tekstil, gıda ve daha birçok sektördeki firmaya hizmet vermektedir. <a href="/firmalar" class="cb-link">Firma Rehberi</a>''nde sektöre göre arama yapabilirsiniz.'
),
(
  array['mobil', 'telefon', 'tablet', 'uygulama', 'ios', 'android'],
  'Tedport tüm modern tarayıcılarda ve mobil cihazlarda sorunsuz çalışır. Ayrı bir uygulama indirmenize gerek yok — tarayıcınızdan doğrudan kullanabilirsiniz.'
),
(
  array['avantaj', 'fayda', 'neden tedport', 'neden kullanmalı'],
  'Tedport ile ihale süreçlerinizi dijitalleştirip doğru tedarikçilere hızla ulaşabilirsiniz. Ücretsiz kayıt, kolay ihale yönetimi ve geniş firma ağı temel avantajlardandır.'
),
(
  array['hakkımızda', 'ekip', 'kim kurdu', 'tedport kimler', 'şirket'],
  'Tedport ekibi ve misyonumuz hakkında bilgi almak için <a href="/hakkimizda" class="cb-link">Hakkımızda</a> sayfasını ziyaret edebilirsiniz.'
),

-- ── 2. KAYIT / ÜYELİK ───────────────────────────────────────────────────────
(
  array['kayıt', 'üye', 'hesap aç', 'nasıl üye', 'ücretsiz', 'kaydol'],
  'Kayıt olmak tamamen ücretsizdir! <a href="/register" class="cb-link">Kayıt Ol</a> sayfasından bireysel veya kurumsal hesap oluşturabilirsiniz. Kurumsal başvurular 24 saat içinde incelenir.'
),
(
  array['bireysel', 'hesap türü', 'fark', 'kurumsal fark', 'hangi hesap seçmeliyim'],
  'Bireysel hesapla platformu keşfedebilirsiniz. Kurumsal hesapla ihale açma, teklif verme ve firma rehberine eklenme gibi gelişmiş özelliklerden yararlanırsınız.'
),
(
  array['e-posta doğrulama', 'onay maili', 'aktivasyon', 'doğrulama maili', 'mail onay'],
  'Kayıt sonrası e-posta adresinize bir doğrulama maili gönderilir. Spam/Gereksiz klasörünü kontrol edin. Linke tıklayarak hesabınızı aktif edin.'
),
(
  array['hesap sil', 'üyelik iptal', 'hesap kapatma', 'çıkmak istiyorum', 'hesabımı silmek'],
  'Hesap silme işlemi için <a href="/iletisim" class="cb-link">İletişim</a> sayfasından bize ulaşın. Talebiniz en kısa sürede işleme alınır.'
),
(
  array['iki hesap', 'çift hesap', 'aynı email', 'birden fazla hesap'],
  'Her e-posta adresiyle yalnızca bir hesap oluşturulabilir. Farklı bir hesap açmak için farklı bir e-posta adresi kullanmalısınız.'
),
(
  array['kayıt için ne gerekir', 'belge gerekli mi', 'hangi bilgiler lazım', 'kayıt bilgileri'],
  'Bireysel kayıt için ad, soyad ve e-posta yeterlidir. Kurumsal kayıt için ek olarak şirket adı, vergi numarası ve sektör bilgisi istenebilir.'
),

-- ── 3. KURUMSAL BAŞVURU ──────────────────────────────────────────────────────
(
  array['kurumsal', 'kurum', 'şirket', 'firma kaydı', 'kurumsal başvuru'],
  'Kurumsal üyelik için kayıt sırasında "Kurumsal Hesap" seçeneğini işaretleyip şirket bilgilerinizi girmeniz yeterli. Başvurunuz en geç <strong>24 saat</strong> içinde incelenir ve sonucu e-posta ile bildirilir.'
),
(
  array['kurumsal belge', 'evrak', 'vergi numarası', 'hangi belgeler kurumsal'],
  'Kurumsal başvuruda şirket adı, vergi numarası ve faaliyet alanı bilgileri istenmektedir. Ek doğrulama gerekirse ekibimiz sizinle iletişime geçer.'
),
(
  array['reddedildi', 'ret', 'başvuru kabul edilmedi', 'onaylanmadı', 'red cevabı'],
  'Başvurunuz reddedildiyse size gönderilen e-postada gerekçe yer alır. Eksik bilgileri tamamlayıp tekrar başvurabilir ya da <a href="/iletisim" class="cb-link">İletişim</a> sayfasından destek alabilirsiniz.'
),
(
  array['onaylandı ne olur', 'kurumsal sonra ne', 'onay sonrası', 'kurumsal özellik'],
  'Kurumsal hesabınız onaylandıktan sonra ihale oluşturabilir, teklif verebilir ve firma rehberine eklenebilirsiniz. Tüm özelliklere anında erişim sağlanır.'
),
(
  array['birden fazla firma', 'çoklu firma', 'iki firma', 'birkaç şirket'],
  'Şu an için bir hesap tek bir kurumsal firma profiliyle ilişkilendirilebilir. Birden fazla firma için <a href="/iletisim" class="cb-link">İletişim</a> sayfasından destek talep edebilirsiniz.'
),
(
  array['onay', 'onaylandı', 'hesap onayı', 'başvuru', 'ne zaman', 'incelenecek', 'sonuç', 'ne zaman onaylanır', 'bekleme süresi'],
  'Kurumsal başvurular en geç <strong>24 saat</strong> içinde incelenir. Başvurunuzun sonucu e-posta adresinize bildirilir. Spam klasörünüzü de kontrol etmeyi unutmayın!'
),

-- ── 4. GİRİŞ / ŞİFRE ────────────────────────────────────────────────────────
(
  array['şifre', 'şifremi', 'parola', 'şifre sıfırla'],
  'Şifrenizi unuttuysanız <a href="/login" class="cb-link">Giriş Yap</a> sayfasındaki "Şifremi Unuttum" bağlantısını kullanabilirsiniz. E-posta adresinize sıfırlama linki gönderilir.'
),
(
  array['şifre değiştir', 'parola güncelle', 'yeni şifre', 'şifremi değiştirmek'],
  'Şifrenizi <a href="/profile" class="cb-link">Profilim</a> sayfasındaki Güvenlik bölümünden değiştirebilirsiniz.'
),
(
  array['email değiştir', 'e-posta güncelle', 'e-posta değiştirmek', 'mail değiştir'],
  'E-posta adresinizi <a href="/profile" class="cb-link">Profilim</a> sayfasından güncelleyebilirsiniz. Yeni adrese bir doğrulama maili gönderilir.'
),
(
  array['giriş sorunu', 'oturum açamıyorum', 'giriş olmadı', 'giremiyorum', 'giriş yapamıyorum'],
  'Giriş sorunu yaşıyorsanız şifrenizi sıfırlamayı deneyin. Sorun devam ederse <a href="/iletisim" class="cb-link">İletişim</a> sayfasından bize ulaşın.'
),
(
  array['sıfırlama maili gelmiyor', 'mail gelmedi', 'şifre maili', 'sıfırlama linki gelmiyor'],
  'Şifre sıfırlama maili birkaç dakika içinde gelmelidir. Spam veya Gereksiz klasörünüzü kontrol edin. Hâlâ gelmediyse <a href="/iletisim" class="cb-link">İletişim</a> sayfasından bildirin.'
),

-- ── 5. İHALE YÖNETİMİ ───────────────────────────────────────────────────────
(
  array['ihale', 'ilan', 'oluştur', 'oluşturulur', 'ihale ver', 'ihale ekle'],
  'İhale oluşturmak için kurumsal hesabınızla giriş yapıp <a href="/ihaleler" class="cb-link">İhaleler</a> sayfasına gidin ve "Yeni İhale Ekle" butonuna tıklayın. Davetli firmalar veya herkese açık olarak yayınlayabilirsiniz.'
),
(
  array['ihale için kurumsal', 'kurumsal gerekli mi', 'ihale koşul', 'ihale açmak için'],
  'İhale açmak için kurumsal ve onaylı bir hesabınızın olması gerekmektedir. <a href="/register" class="cb-link">Kayıt Ol</a> sayfasından kurumsal başvuru yapabilirsiniz.'
),
(
  array['ihale görünürlük', 'kim görebilir', 'gizli ihale', 'ihale herkese açık'],
  'İhale oluştururken "Herkese Açık" veya "Davetli Firmalar" seçeneğini belirleyebilirsiniz. Davetli seçeneğinde yalnızca davet ettiğiniz firmalar görür.'
),
(
  array['davetli ihale', 'kapalı ihale', 'özel ihale', 'davetli firma'],
  'Davetli ihale sadece seçtiğiniz firmalara görünür. İhale oluştururken firma e-postalarını girerek davet gönderebilirsiniz.'
),
(
  array['ihale düzenle', 'ihale güncelle', 'ihale değiştir', 'ihale düzenleme'],
  'Yayındaki bir ihaleyi <a href="/ihaleler" class="cb-link">İhaleler</a> sayfasından düzenleyebilirsiniz. Teklif alınmış ihalelerde bazı alanlar kısıtlı olabilir.'
),
(
  array['ihale sil', 'yayından kaldır', 'ihale iptal', 'ihaleyi kaldır'],
  'İhaleyi <a href="/ihaleler" class="cb-link">İhaleler</a> sayfasındaki yönetim panelinden yayından kaldırabilir veya silebilirsiniz.'
),
(
  array['ihale limit', 'kaç tane ihale', 'ihale sınır', 'aynı anda kaç ihale'],
  'Kurumsal hesaplarda aynı anda birden fazla aktif ihale açabilirsiniz. Özel kota limitleri için <a href="/iletisim" class="cb-link">İletişim</a> sayfasından bilgi alabilirsiniz.'
),
(
  array['ek dosya', 'dosya yükle', 'ihale belgesi', 'ihale eki', 'dosya ekle', 'şartname'],
  'İhale oluştururken teknik şartname, çizim veya diğer belgeleri ek dosya olarak yükleyebilirsiniz. Desteklenen formatlar: PDF, DOC, XLS, JPG, PNG.'
),
(
  array['ihale bitti', 'süre doldu', 'ihale sonuç', 'ihale sona erdi', 'son başvuru'],
  'Son başvuru tarihi geçen ihaleler otomatik kapanır. Gelen teklifleri <a href="/ihaleler" class="cb-link">İhaleler</a> panelinden değerlendirip kazananı belirleyebilirsiniz.'
),
(
  array['ihale referans', 'referans no', 'ihale kodu', 'ihale numarası'],
  'Her ihaleye otomatik bir referans numarası atanır. Bu numarayı firmalarla paylaşarak ihalenize doğrudan erişmelerini sağlayabilirsiniz.'
),

-- ── 6. TEKLİF VERME ─────────────────────────────────────────────────────────
(
  array['teklif', 'veririm', 'nasıl teklif', 'fiyat teklifi', 'teklif vermek'],
  'İhale ilanlarına teklif vermek için <a href="/ihaleler" class="cb-link">İhaleler</a> sayfasından ilgili ilanı açıp "Teklif Ver" butonunu kullanabilirsiniz. Tekliflerinizi <a href="/profile" class="cb-link">Profilim</a> sayfasından takip edebilirsiniz.'
),
(
  array['teklif limit', 'kaç teklif', 'teklif sınır', 'tekrar teklif', 'aynı ihaleye iki teklif'],
  'Aynı ihaleye birden fazla teklif veremezsiniz; ancak mevcut teklifinizi güncelleyebilirsiniz. Farklı ihalelere sınırsız teklif verebilirsiniz.'
),
(
  array['teklif geri çek', 'teklif iptal', 'teklifi kaldır', 'teklif silinsin'],
  'Teklifinizi son başvuru tarihi dolmadan <a href="/profile" class="cb-link">Profilim</a> sayfasındaki Tekliflerim bölümünden geri çekebilirsiniz.'
),
(
  array['teklif kabul', 'teklif bildirim', 'teklif sonuç', 'kabul edildi mi', 'kazandım mı'],
  'Teklifiniz değerlendirildiğinde e-posta ve platform bildirimi alırsınız. Tekliflerinizin durumunu <a href="/profile" class="cb-link">Profilim</a> → Tekliflerim bölümünden takip edebilirsiniz.'
),
(
  array['teklif eki', 'teklif dosya', 'teklif belgesi', 'teklif döküman'],
  'Teklif verirken fiyat teklifinin yanına PDF, Excel veya diğer belgelerinizi ek olarak yükleyebilirsiniz.'
),
(
  array['teklif fiyat', 'para birimi', 'kdv', 'fiyat formatı', 'döviz'],
  'Teklifinizi TL, USD veya EUR cinsinden girebilirsiniz. KDV dahil/hariç bilgisini de belirtmeniz önerilir.'
),

-- ── 7. FİRMA REHBERİ ────────────────────────────────────────────────────────
(
  array['firma', 'rehber', 'firma bul', 'tedarikçi', 'firmalar'],
  'Binlerce firmayı <a href="/firmalar" class="cb-link">Firma Rehberi</a> sayfasında sektör ve şehre göre filtreleyerek bulabilirsiniz. Firma profillerinde iletişim bilgileri ve hizmet detayları yer almaktadır.'
),
(
  array['firma ekle', 'rehbere ekle', 'firmamı eklemek', 'firmamı kaydetmek'],
  'Firmanızı rehbere eklemek için kurumsal hesabınızla giriş yapıp <a href="/profile" class="cb-link">Profilim</a> sayfasından firma bilgilerinizi doldurmanız yeterlidir.'
),
(
  array['firma güncelle', 'firma bilgisi', 'firma düzenle', 'şirket bilgisi güncelle'],
  'Firma bilgilerinizi <a href="/profile" class="cb-link">Profilim</a> sayfasından güncelleyebilirsiniz.'
),
(
  array['logo yükle', 'firma görseli', 'firma resmi', 'firma logosu'],
  'Firma logonuzu <a href="/profile" class="cb-link">Profilim</a> sayfasındaki logo yükleme alanından JPG veya PNG formatında yükleyebilirsiniz.'
),
(
  array['filtre', 'sektör filtre', 'şehir filtre', 'arama filtresi', 'firmaları ara'],
  '<a href="/firmalar" class="cb-link">Firma Rehberi</a>''nde sektör, şehir ve anahtar kelime filtrelerini kullanarak aradığınız firmayı hızlıca bulabilirsiniz.'
),

-- ── 8. PROFİL VE HESAP ──────────────────────────────────────────────────────
(
  array['profil', 'bilgilerimi güncelle', 'profil düzenle', 'hesap bilgileri'],
  'Profil bilgilerinizi ve şirket logonuzu <a href="/profile" class="cb-link">Profilim</a> sayfasından güncelleyebilirsiniz.'
),

-- ── 9. BİLDİRİMLER ──────────────────────────────────────────────────────────
(
  array['bildirim nasıl', 'bildirim çalışır', 'anlık bildirim', 'zil ikonu'],
  'Bildirimler sağ üstteki zil ikonundan takip edilebilir. İhale güncellemeleri, teklif sonuçları ve sistem mesajları bildirim olarak iletilir.'
),
(
  array['bildirim ne zaman', 'hangi durumda bildirim', 'ne zaman bildirim alırım'],
  'Yeni teklif geldiğinde, ihale süreniz dolduğunda, teklifiniz sonuçlandığında ve sistem duyurularında bildirim alırsınız.'
),
(
  array['bildirim kapat', 'email bildirimi', 'bildirim ayar', 'bildirimleri yönet'],
  'Bildirim tercihlerinizi <a href="/profile" class="cb-link">Profilim</a> sayfasındaki Bildirim Ayarları bölümünden özelleştirebilirsiniz.'
),

-- ── 10. FİYATLANDIRMA ───────────────────────────────────────────────────────
(
  array['ücret', 'fiyat', 'ödeme', 'bedava', 'para'],
  'Tedport''ta temel üyelik ve firma rehberi <strong>tamamen ücretsizdir</strong>. İhale yönetimi ve gelişmiş özellikler için premium paketlerimize göz atabilirsiniz.'
),
(
  array['premium', 'ücretli paket', 'abonelik', 'premium özellik'],
  'Temel özellikler tamamen ücretsizdir. Premium paketler; öncelikli listeleme ve öncelikli destek gibi ek avantajlar sunar. Detaylar için <a href="/iletisim" class="cb-link">İletişim</a>''e yazın.'
),
(
  array['fatura', 'e-fatura', 'faturamı almak', 'fatura talep'],
  'Fatura talepleriniz için <a href="/iletisim" class="cb-link">İletişim</a> sayfasından bize ulaşın. Faturalar kayıtlı e-posta adresinize gönderilir.'
),

-- ── 11. TEKNİK ──────────────────────────────────────────────────────────────
(
  array['tarayıcı', 'chrome', 'firefox', 'safari', 'edge', 'hangi tarayıcı'],
  'Tedport; Chrome, Firefox, Safari ve Edge''in güncel sürümlerinde sorunsuz çalışır. En iyi deneyim için tarayıcınızı güncel tutmanızı öneririz.'
),
(
  array['hata', 'yüklenmiyor', 'çalışmıyor', 'teknik sorun', 'sayfa açılmıyor'],
  'Teknik bir sorunla karşılaştıysanız sayfayı yenilemeyi veya önbelleği temizlemeyi deneyin. Sorun devam ederse <a href="/iletisim" class="cb-link">İletişim</a> sayfasından ekibimize bildirin.'
),

-- ── 12. FAVORİLER ───────────────────────────────────────────────────────────
(
  array['favori', 'kaydet firma', 'favori firma', 'favorilerim'],
  'Firma profilindeki kalp ikonuna tıklayarak firmaları favorilerinize ekleyebilirsiniz. Favori firmalarınıza <a href="/profile" class="cb-link">Profilim</a> → Favorilerim bölümünden ulaşabilirsiniz.'
),

-- ── 13. TEKLİF TALEBİ ───────────────────────────────────────────────────────
(
  array['teklif talebi', 'talep nedir', 'teklif isteği', 'teklif talepleri'],
  'Teklif talebi; ihtiyacınızı platformda yayınlayarak uygun firmalardan fiyat teklifi istemenizi sağlar. <a href="/profile" class="cb-link">Profilim</a> → Teklif Taleplerim bölümünden yönetebilirsiniz.'
),

-- ── 14. KVKK / GİZLİLİK ─────────────────────────────────────────────────────
(
  array['kvkk', 'gizlilik', 'kişisel veri', 'politika'],
  'Kişisel verilerinizin korunması hakkında bilgi almak için <a href="/kvkk" class="cb-link">KVKK</a> ve <a href="/gizlilik-politikasi" class="cb-link">Gizlilik Politikası</a> sayfalarımızı inceleyebilirsiniz.'
),
(
  array['verilerimi sil', 'veri silme', 'kişisel veri sil', 'unutulma hakkı'],
  'KVKK kapsamında kişisel verilerinizin silinmesini talep etmek için <a href="/iletisim" class="cb-link">İletişim</a> sayfasından yazılı başvuru yapabilirsiniz.'
),
(
  array['veri güvenliği', 'verilerim güvende', 'şifreleme', 'ssl'],
  'Tedport, verilerinizi SSL şifrelemesi ve güvenli sunucularda korur. Detaylı bilgi için <a href="/gizlilik-politikasi" class="cb-link">Gizlilik Politikası</a> sayfamızı inceleyebilirsiniz.'
),
(
  array['hizmet şartları', 'kullanım koşulları', 'kurallar', 'şartlar'],
  'Platform kullanım koşullarına ulaşmak için <a href="/hizmet-sartlari" class="cb-link">Hizmet Şartları</a> sayfamızı inceleyebilirsiniz.'
),

-- ── 15. DESTEK / İLETİŞİM ───────────────────────────────────────────────────
(
  array['iletişim', 'destek', 'yardım', 'mail', 'e-posta', 'telefon', 'bize ulaş', 'ulaşmak istiyorum'],
  'Bize <a href="/iletisim" class="cb-link">İletişim</a> sayfasından ulaşabilirsiniz. Mesajınız en kısa sürede ekibimiz tarafından yanıtlanacaktır.'
),
(
  array['öneri', 'geri bildirim', 'şikayet', 'memnun değilim', 'sorun bildirmek'],
  'Öneri, şikayet veya geri bildiriminiz için <a href="/iletisim" class="cb-link">İletişim</a> sayfasından bize yazabilirsiniz. Her geri bildirim bizim için değerlidir.'
);

-- ─── Hızlı Sorular ──────────────────────────────────────────────────────────
insert into public.chatbot_quick_questions (question, sort_order) values
('Tedport nedir?',                    1),
('Nasıl kayıt olabilirim?',           2),
('Kurumsal üyelik nasıl işliyor?',    3),
('İhale nasıl oluşturulur?',          4),
('Teklif nasıl veririm?',             5),
('Firma rehberine nasıl eklenirim?',  6),
('Ücretsiz mi?',                      7),
('Destek almak istiyorum',            8);
