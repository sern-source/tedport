-- Chatbot Q&A bilgi tabanı tablosu
create table if not exists public.chatbot_qa (
  id          bigint generated always as identity primary key,
  keywords    text[]    not null default '{}',
  answer      text      not null,
  is_active   boolean   not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Hızlı sorular tablosu
create table if not exists public.chatbot_quick_questions (
  id          bigint generated always as identity primary key,
  question    text      not null,
  sort_order  int       not null default 0,
  is_active   boolean   not null default true,
  created_at  timestamptz not null default now()
);

-- updated_at otomatik güncelle
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists chatbot_qa_updated_at on public.chatbot_qa;
create trigger chatbot_qa_updated_at
  before update on public.chatbot_qa
  for each row execute procedure public.set_updated_at();

-- RLS: herkes okuyabilir (chatbot), sadece admin yazabilir
alter table public.chatbot_qa enable row level security;
alter table public.chatbot_quick_questions enable row level security;

create policy "Public read chatbot_qa"
  on public.chatbot_qa for select using (true);

create policy "Public read chatbot_quick_questions"
  on public.chatbot_quick_questions for select using (true);

create policy "Auth insert chatbot_qa"
  on public.chatbot_qa for insert to authenticated with check (true);

create policy "Auth update chatbot_qa"
  on public.chatbot_qa for update to authenticated using (true);

create policy "Auth delete chatbot_qa"
  on public.chatbot_qa for delete to authenticated using (true);

create policy "Auth insert chatbot_quick_questions"
  on public.chatbot_quick_questions for insert to authenticated with check (true);

create policy "Auth update chatbot_quick_questions"
  on public.chatbot_quick_questions for update to authenticated using (true);

create policy "Auth delete chatbot_quick_questions"
  on public.chatbot_quick_questions for delete to authenticated using (true);

-- ─── Başlangıç verileri ────────────────────────────────────────────────────────
insert into public.chatbot_qa (keywords, answer) values
(
  array['tedport', 'nedir', 'platform', 'hakkında', 'ne iş'],
  'Tedport, Türkiye''nin güvenilir B2B tedarik platformudur. Firmalar arası ticareti dijitalleştiriyor; ihale ilanı verme, teklif alma ve firma rehberi hizmetleri sunuyoruz.'
),
(
  array['kayıt', 'üye', 'hesap aç', 'nasıl üye', 'ücretsiz', 'kaydol'],
  'Kayıt olmak tamamen ücretsizdir! <a href="/register" class="cb-link">Kayıt Ol</a> sayfasından bireysel veya kurumsal hesap oluşturabilirsiniz. Kurumsal başvurular 24 saat içinde incelenir.'
),
(
  array['kurumsal', 'kurum', 'şirket', 'firma kaydı', 'kurumsal başvuru'],
  'Kurumsal üyelik için kayıt sırasında "Kurumsal Hesap" seçeneğini işaretleyip şirket bilgilerinizi girmeniz yeterli. Başvurunuz en geç <strong>24 saat</strong> içinde incelenir ve sonucu e-posta ile bildirilir.'
),
(
  array['ihale', 'ilan', 'oluştur', 'oluşturulur', 'ihale ver', 'ihale ekle'],
  'İhale oluşturmak için kurumsal hesabınızla giriş yapıp <a href="/ihaleler" class="cb-link">İhaleler</a> sayfasına gidin ve "Yeni İhale Ekle" butonuna tıklayın. Davetli firmalar veya herkese açık olarak yayınlayabilirsiniz.'
),
(
  array['teklif', 'veririm', 'nasıl teklif', 'fiyat teklifi', 'teklif vermek'],
  'İhale ilanlarına teklif vermek için <a href="/ihaleler" class="cb-link">İhaleler</a> sayfasından ilgili ilanı açıp "Teklif Ver" butonunu kullanabilirsiniz. Tekliflerinizi <a href="/profile" class="cb-link">Profilim</a> sayfasından takip edebilirsiniz.'
),
(
  array['firma', 'rehber', 'firma bul', 'tedarikçi', 'firmalar'],
  'Binlerce firmayı <a href="/firmalar" class="cb-link">Firma Rehberi</a> sayfasında sektör ve şehre göre filtreleyerek bulabilirsiniz. Firma profillerinde iletişim bilgileri ve hizmet detayları yer almaktadır.'
),
(
  array['ücret', 'fiyat', 'ödeme', 'bedava', 'para'],
  'Tedport''ta temel üyelik ve firma rehberi <strong>tamamen ücretsizdir</strong>. İhale yönetimi ve gelişmiş özellikler için premium paketlerimize göz atabilirsiniz.'
),
(
  array['şifre', 'şifremi', 'parola', 'giriş yapamıyorum', 'şifre sıfırla'],
  'Şifrenizi unuttuysanız <a href="/login" class="cb-link">Giriş Yap</a> sayfasındaki "Şifremi Unuttum" bağlantısını kullanabilirsiniz. E-posta adresinize sıfırlama linki gönderilir.'
),
(
  array['iletişim', 'destek', 'yardım', 'mail', 'e-posta', 'telefon', 'bize ulaş', 'ulaşmak istiyorum'],
  'Bize <a href="/iletisim" class="cb-link">İletişim</a> sayfasından ulaşabilirsiniz. Mesajınız en kısa sürede ekibimiz tarafından yanıtlanacaktır.'
),
(
  array['onay', 'onaylandı', 'hesap onayı', 'başvuru', 'ne zaman', 'incelenecek', 'sonuç'],
  'Kurumsal başvurular en geç <strong>24 saat</strong> içinde incelenir. Başvurunuzun sonucu e-posta adresinize bildirilir. Spam klasörünüzü de kontrol etmeyi unutmayın!'
),
(
  array['profil', 'bilgilerimi güncelle', 'logo', 'profil düzenle'],
  'Profil bilgilerinizi ve şirket logonuzu <a href="/profile" class="cb-link">Profilim</a> sayfasından güncelleyebilirsiniz.'
),
(
  array['kvkk', 'gizlilik', 'kişisel veri', 'politika'],
  'Kişisel verilerinizin korunması hakkında bilgi almak için <a href="/kvkk" class="cb-link">KVKK</a> ve <a href="/gizlilik-politikasi" class="cb-link">Gizlilik Politikası</a> sayfalarımızı inceleyebilirsiniz.'
);

insert into public.chatbot_quick_questions (question, sort_order) values
('Tedport nedir?', 1),
('Nasıl kayıt olabilirim?', 2),
('Kurumsal üyelik nasıl işliyor?', 3),
('İhale nasıl oluşturulur?', 4),
('Teklif nasıl veririm?', 5),
('Destek almak istiyorum', 6);
