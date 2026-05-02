-- ═══════════════════════════════════════════════════════════════════════════
-- SSS Sayfası için chatbot_qa tablosuna question + category kolonu ekle
-- Supabase SQL Editor'da çalıştırın.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.chatbot_qa
  ADD COLUMN IF NOT EXISTS question TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT;

-- ─── Platform Genel ─────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Tedport nedir?',                               category='Platform Genel'    WHERE 'tedport'             = ANY(keywords) AND 'nedir'            = ANY(keywords);
UPDATE public.chatbot_qa SET question='Tedport nasıl çalışır?',                       category='Platform Genel'    WHERE 'nasıl çalışır'       = ANY(keywords);
UPDATE public.chatbot_qa SET question='Tedport güvenilir mi?',                        category='Platform Genel'    WHERE 'güvenilir'           = ANY(keywords);
UPDATE public.chatbot_qa SET question='Hangi sektörlere hizmet veriyorsunuz?',        category='Platform Genel'    WHERE 'hangi sektör'        = ANY(keywords);
UPDATE public.chatbot_qa SET question='Mobil uygulama var mı?',                       category='Platform Genel'    WHERE 'mobil'               = ANY(keywords);
UPDATE public.chatbot_qa SET question='Neden Tedport kullanmalıyım?',                 category='Platform Genel'    WHERE 'avantaj'             = ANY(keywords);
UPDATE public.chatbot_qa SET question='Tedport kimler tarafından kuruldu?',           category='Platform Genel'    WHERE 'hakkımızda'          = ANY(keywords);

-- ─── Kayıt ve Üyelik ────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Nasıl üye olabilirim?',                        category='Kayıt ve Üyelik'   WHERE 'kayıt'               = ANY(keywords) AND 'üye' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Bireysel ve kurumsal hesap farkı nedir?',      category='Kayıt ve Üyelik'   WHERE 'bireysel'            = ANY(keywords);
UPDATE public.chatbot_qa SET question='E-posta doğrulama maili gelmedi, ne yapmalıyım?', category='Kayıt ve Üyelik' WHERE 'e-posta doğrulama'  = ANY(keywords);
UPDATE public.chatbot_qa SET question='Hesabımı nasıl silebilirim?',                  category='Kayıt ve Üyelik'   WHERE 'hesap sil'           = ANY(keywords);
UPDATE public.chatbot_qa SET question='Aynı e-posta ile iki hesap açılabilir mi?',    category='Kayıt ve Üyelik'   WHERE 'iki hesap'           = ANY(keywords);
UPDATE public.chatbot_qa SET question='Kayıt için hangi bilgiler gerekiyor?',         category='Kayıt ve Üyelik'   WHERE 'kayıt için ne gerekir' = ANY(keywords);

-- ─── Kurumsal Başvuru ────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Kurumsal üyelik nasıl başvurulur?',            category='Kurumsal Başvuru'  WHERE 'kurumsal'            = ANY(keywords) AND 'kurum' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Kurumsal başvuru için hangi belgeler gerekiyor?', category='Kurumsal Başvuru' WHERE 'kurumsal belge'      = ANY(keywords);
UPDATE public.chatbot_qa SET question='Kurumsal başvurum reddedildi, ne yapmalıyım?', category='Kurumsal Başvuru'  WHERE 'reddedildi'          = ANY(keywords);
UPDATE public.chatbot_qa SET question='Kurumsal hesap onaylandıktan sonra ne yapabilirim?', category='Kurumsal Başvuru' WHERE 'onaylandı ne olur' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Birden fazla firma için hesap açabilir miyim?', category='Kurumsal Başvuru' WHERE 'birden fazla firma'   = ANY(keywords);
UPDATE public.chatbot_qa SET question='Kurumsal başvurum ne zaman onaylanır?',        category='Kurumsal Başvuru'  WHERE 'ne zaman onaylanır'  = ANY(keywords);

-- ─── Giriş ve Şifre ─────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Şifremi unuttum, ne yapmalıyım?',              category='Giriş ve Şifre'    WHERE 'şifre sıfırla'       = ANY(keywords) AND 'şifre' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Şifremi nasıl değiştirebilirim?',              category='Giriş ve Şifre'    WHERE 'şifre değiştir'      = ANY(keywords);
UPDATE public.chatbot_qa SET question='E-posta adresimi nasıl değiştirebilirim?',     category='Giriş ve Şifre'    WHERE 'email değiştir'      = ANY(keywords);
UPDATE public.chatbot_qa SET question='Giriş yapamıyorum, ne yapmalıyım?',            category='Giriş ve Şifre'    WHERE 'giriş sorunu'        = ANY(keywords);
UPDATE public.chatbot_qa SET question='Şifre sıfırlama maili gelmiyor, ne yapmalıyım?', category='Giriş ve Şifre' WHERE 'sıfırlama maili gelmiyor' = ANY(keywords);

-- ─── İhale Yönetimi ─────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Nasıl ihale oluşturabilirim?',                 category='İhale Yönetimi'    WHERE 'oluştur'             = ANY(keywords) AND 'ihale' = ANY(keywords);
UPDATE public.chatbot_qa SET question='İhale açmak için kurumsal hesap gerekli mi?',  category='İhale Yönetimi'    WHERE 'ihale için kurumsal' = ANY(keywords);
UPDATE public.chatbot_qa SET question='İhalemi kimler görebilir?',                    category='İhale Yönetimi'    WHERE 'ihale görünürlük'    = ANY(keywords);
UPDATE public.chatbot_qa SET question='Davetli (kapalı) ihale nasıl oluşturulur?',   category='İhale Yönetimi'    WHERE 'davetli ihale'       = ANY(keywords);
UPDATE public.chatbot_qa SET question='Yayındaki ihalemi nasıl düzenleyebilirim?',    category='İhale Yönetimi'    WHERE 'ihale düzenle'       = ANY(keywords);
UPDATE public.chatbot_qa SET question='İhalemi nasıl silebilir veya yayından kaldırabilirim?', category='İhale Yönetimi' WHERE 'ihale sil'       = ANY(keywords);
UPDATE public.chatbot_qa SET question='Aynı anda kaç ihale açabilirim?',              category='İhale Yönetimi'    WHERE 'ihale limit'         = ANY(keywords);
UPDATE public.chatbot_qa SET question='İhaleye ek dosya yükleyebilir miyim?',         category='İhale Yönetimi'    WHERE 'ek dosya'            = ANY(keywords);
UPDATE public.chatbot_qa SET question='İhale süresi dolduğunda ne olur?',             category='İhale Yönetimi'    WHERE 'ihale bitti'         = ANY(keywords);
UPDATE public.chatbot_qa SET question='İhale referans numarası ne işe yarar?',        category='İhale Yönetimi'    WHERE 'ihale referans'      = ANY(keywords);

-- ─── Teklif Verme ───────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Nasıl teklif verebilirim?',                    category='Teklif Verme'      WHERE 'veririm'             = ANY(keywords) AND 'teklif' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Aynı ihaleye birden fazla teklif verebilir miyim?', category='Teklif Verme' WHERE 'teklif limit'        = ANY(keywords);
UPDATE public.chatbot_qa SET question='Verdiğim teklifi geri çekebilir miyim?',       category='Teklif Verme'      WHERE 'teklif geri çek'     = ANY(keywords);
UPDATE public.chatbot_qa SET question='Teklifim sonuçlandığında nasıl haberdar olurum?', category='Teklif Verme'   WHERE 'teklif kabul'        = ANY(keywords);
UPDATE public.chatbot_qa SET question='Teklife dosya ekleyebilir miyim?',             category='Teklif Verme'      WHERE 'teklif eki'          = ANY(keywords);
UPDATE public.chatbot_qa SET question='Teklifi hangi para biriminde verebilirim?',    category='Teklif Verme'      WHERE 'teklif fiyat'        = ANY(keywords);

-- ─── Firma Rehberi ──────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Firma Rehberini nasıl kullanabilirim?',        category='Firma Rehberi'     WHERE 'firma'               = ANY(keywords) AND 'rehber' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Firmamı rehbere nasıl ekleyebilirim?',         category='Firma Rehberi'     WHERE 'firma ekle'          = ANY(keywords);
UPDATE public.chatbot_qa SET question='Firma bilgilerimi nasıl güncelleyebilirim?',   category='Firma Rehberi'     WHERE 'firma güncelle'      = ANY(keywords);
UPDATE public.chatbot_qa SET question='Firma logosunu nasıl yükleyebilirim?',         category='Firma Rehberi'     WHERE 'logo yükle'          = ANY(keywords);
UPDATE public.chatbot_qa SET question='Firma Rehberinde nasıl arama ve filtre yapabilirim?', category='Firma Rehberi' WHERE 'filtre'            = ANY(keywords) AND 'sektör filtre' = ANY(keywords);

-- ─── Profil ve Hesap ────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Profil bilgilerimi nasıl güncelleyebilirim?',  category='Profil ve Hesap'   WHERE 'profil'              = ANY(keywords) AND 'profil düzenle' = ANY(keywords);

-- ─── Bildirimler ────────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Bildirimler nasıl çalışır?',                   category='Bildirimler'       WHERE 'bildirim nasıl'      = ANY(keywords);
UPDATE public.chatbot_qa SET question='Hangi durumlarda bildirim alırım?',            category='Bildirimler'       WHERE 'bildirim ne zaman'   = ANY(keywords);
UPDATE public.chatbot_qa SET question='Bildirim tercihlerimi nasıl değiştirebilirim?', category='Bildirimler'      WHERE 'bildirim kapat'      = ANY(keywords);

-- ─── Fiyatlandırma ──────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Tedport ücretli mi?',                          category='Fiyatlandırma'     WHERE 'ücret'               = ANY(keywords) AND 'fiyat' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Premium özellikler nelerdir?',                 category='Fiyatlandırma'     WHERE 'premium'             = ANY(keywords);
UPDATE public.chatbot_qa SET question='Fatura alabilir miyim?',                       category='Fiyatlandırma'     WHERE 'fatura'              = ANY(keywords);

-- ─── Teknik ─────────────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Hangi tarayıcılar destekleniyor?',             category='Teknik'            WHERE 'tarayıcı'            = ANY(keywords);
UPDATE public.chatbot_qa SET question='Sayfalar yüklenmiyor, ne yapmalıyım?',         category='Teknik'            WHERE 'yüklenmiyor'         = ANY(keywords);

-- ─── Favoriler ──────────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Firmayı favorilere nasıl ekleyebilirim?',      category='Favoriler'         WHERE 'favori'              = ANY(keywords);

-- ─── Teklif Talebi ──────────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Teklif talebi nedir ve nasıl kullanılır?',     category='Teklif Talebi'     WHERE 'teklif talebi'       = ANY(keywords);

-- ─── Gizlilik ve KVKK ───────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Kişisel verilerim nasıl korunuyor?',           category='Gizlilik ve KVKK'  WHERE 'kvkk'                = ANY(keywords);
UPDATE public.chatbot_qa SET question='Kişisel verilerimin silinmesini nasıl talep edebilirim?', category='Gizlilik ve KVKK' WHERE 'verilerimi sil' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Verilerim güvende mi?',                        category='Gizlilik ve KVKK'  WHERE 'veri güvenliği'      = ANY(keywords);
UPDATE public.chatbot_qa SET question='Hizmet şartlarını nerede bulabilirim?',        category='Gizlilik ve KVKK'  WHERE 'hizmet şartları'     = ANY(keywords);

-- ─── Destek ve İletişim ─────────────────────────────────────────────────────
UPDATE public.chatbot_qa SET question='Destek için nasıl iletişime geçebilirim?',     category='Destek ve İletişim' WHERE 'iletişim'            = ANY(keywords) AND 'destek' = ANY(keywords);
UPDATE public.chatbot_qa SET question='Öneri veya şikayetlerimi nasıl iletebilirim?', category='Destek ve İletişim' WHERE 'öneri'               = ANY(keywords);
