# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase Mimarisi

Bu projede server-side işlerin tamamı Supabase tarafına taşındı.

Ana parçalar:

1. SQL şemaları:
	[database/reminders.sql](database/reminders.sql)
	[database/corporate_applications.sql](database/corporate_applications.sql)
2. Edge Functions:
	[supabase/functions/process-reminders/index.ts](supabase/functions/process-reminders/index.ts)
	[supabase/functions/corporate-applications/index.ts](supabase/functions/corporate-applications/index.ts)
	[supabase/functions/company-management/index.ts](supabase/functions/company-management/index.ts)
3. Supabase cron kurulumu:
	[database/supabase_edge_cron.sql](database/supabase_edge_cron.sql)
4. Frontend ekranları:
	[src/Register.jsx](src/Register.jsx)
	[src/AdminCorporateApplications.jsx](src/AdminCorporateApplications.jsx)
	[src/FirmaDetay.jsx](src/FirmaDetay.jsx)
	[src/Profile.jsx](src/Profile.jsx)

## Kurulum Sırası

1. Supabase SQL Editor içinde şu dosyaları çalıştırın:
	[database/reminders.sql](database/reminders.sql)
	[database/corporate_applications.sql](database/corporate_applications.sql)
2. Gerekirse admin e-posta adresinizi ekleyin:
	`insert into public.admin_epostalari (email) values ('senin-admin-epostan@ornek.com') on conflict (email) do nothing;`
3. Supabase CLI ile Edge Function'ları deploy edin:
	`supabase functions deploy corporate-applications`
	`supabase functions deploy process-reminders`
	`supabase functions deploy company-management`
4. Supabase project secrets alanına aşağıdaki secret'ları girin.
5. Hatırlatıcı cron job'ını kurmak için [database/supabase_edge_cron.sql](database/supabase_edge_cron.sql) dosyasındaki `PROJECT_REF`, `EDGE_FUNCTION_SECRET` ve `SUPABASE_LEGACY_ANON_KEY` alanlarını kendi değerlerinizle değiştirip çalıştırın.
	Cron tetikleyicisi Edge Function gateway'ini geçebilmek için `Authorization` ve `apikey` header'larında Project Settings > API > Legacy anon, service_role API keys ekranındaki `anon` JWT anahtarını kullanır. Yeni `sb_publishable_...` anahtarı `Bearer` header'ında kabul edilmez. `X-Edge-Function-Secret` ise ayrıca sizin belirlediğiniz ayrı secret olmalıdır.
6. Kurumsal firma sahipliği ve yönetim alanı için [database/corporate_applications.sql](database/corporate_applications.sql) dosyasını son haliyle tekrar çalıştırın.

## Gerekli Supabase Secrets

Minimum gerekli olanlar:

1. `EDGE_FUNCTION_SECRET`
	Hatırlatıcı edge function'ını cron ile güvenli tetiklemek için kullanılır.
2. `APP_BASE_URL`
	Mail içindeki bağlantıların döneceği adres.

Mail akışı için gerekli olanlar:

3. `RESEND_API_KEY`
	Resend API anahtarı.
4. `REMINDER_FROM_EMAIL`
	Hatırlatma maillerinin çıkacağı adres.
5. `CORPORATE_FROM_EMAIL`
	Kurumsal onay maillerinin çıkacağı adres. İsterseniz `REMINDER_FROM_EMAIL` ile aynı olabilir.

Not:

1. `SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` Edge Functions ortamında Supabase tarafından sağlanır.
2. Frontend tarafında ekstra `VITE_API_BASE_URL` veya Vercel env ihtiyacı kalmadı.

## Hatırlatıcı Akışı

Hatırlatıcı özelliği şu şekilde çalışır:

1. Kullanıcı frontend üzerinden nota hatırlatıcı ekler.
2. Kayıt [database/reminders.sql](database/reminders.sql) ile oluşturulan tablolara düşer.
3. Supabase cron, [supabase/functions/process-reminders/index.ts](supabase/functions/process-reminders/index.ts) function'ını dakikada bir çağırır.
4. Function zamanı gelen kayıtları bulur, Resend ile mail gönderir ve profil bildirimini oluşturur.

Notlar:

1. SQL tabloları kurulmadan frontend tarafı kırılmaz; ancak hatırlatıcı ve bildirim özellikleri boş görünür.
2. Secret'lar eksikse kayıtlar oluşabilir; ancak mail gönderimi ve cron işleme tarafı çalışmaz.

## Kurumsal Başvuru Akışı

Kurumsal kayıt akışı doğrudan kullanıcı açmaz; önce başvuru oluşturur, sonra admin incelemesiyle hesap açılır.

Akış:

1. Kullanıcı [src/Register.jsx](src/Register.jsx) içindeki kurumsal başvuru formunu doldurur.
2. Başvuru [supabase/functions/corporate-applications/index.ts](supabase/functions/corporate-applications/index.ts) üzerinden kaydedilir.
3. Admin kullanıcı [src/AdminCorporateApplications.jsx](src/AdminCorporateApplications.jsx) ekranında başvuruyu inceler.
4. Onay sırasında Edge Function kullanıcıyı oluşturur, `firmalar` tablosuna şirket kaydını ekler, kullanıcıyı o firma ile eşler, şifre belirleme linki üretir ve onay mailini gönderir.
5. Kurumsal kullanıcı giriş yaptığında bireysel profile değil, kendi firma detay sayfasındaki yönetim paneline yönlenir ve [supabase/functions/company-management/index.ts](supabase/functions/company-management/index.ts) üzerinden firma bilgilerini günceller.

Notlar:

1. Admin erişimi `admin_epostalari` tablosu üzerinden yönetilir.
2. Onaylanan kurumsal kullanıcılar `kurumsal_firma_yoneticileri` tablosu üzerinden kendi firmalarına bağlanır.
3. Mail secret'ları eksikse başvuru ve inceleme akışı fallback modunda çalışır; durum güncellenir ama otomatik kullanıcı açma ve mail gönderimi beklemede kalır.
4. Vercel API route veya Vercel cron bağımlılığı kaldırıldı; bu akışlar tamamen Supabase tarafında çalışır.
