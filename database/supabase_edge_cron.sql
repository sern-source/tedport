-- Enes Doğanay | 6 Nisan 2026: Hatirlatici edge function'ini Supabase pg_cron ile dakikada bir tetikler

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Asagidaki URL'deki PROJECT_REF kismini kendi Supabase proje ref'inizle degistirin.
-- EDGE_FUNCTION_SECRET degerini Supabase Edge Function secrets'a eklediginiz secret ile ayni yapin.
-- SUPABASE_LEGACY_ANON_KEY degerini Project Settings > API > Legacy anon, service_role API keys ekranindaki anon JWT key ile degistirin.

select
  cron.schedule(
    'tedport-process-reminders-every-minute',
    '* * * * *',
    $$
    select
      net.http_post(
        url := 'https://gsdbutprqfnxjtppwwhn.supabase.co/functions/v1/process-reminders',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer SUPABASE_LEGACY_ANON_KEY',
          'apikey', 'SUPABASE_LEGACY_ANON_KEY',
          'X-Edge-Function-Secret', 'EDGE_FUNCTION_SECRET'
        ),
        body := jsonb_build_object('source', 'pg_cron')
      );
    $$
  );

-- Gerekirse kaldirmak icin:
-- select cron.unschedule('tedport-process-reminders-every-minute');