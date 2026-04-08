-- Enes Doğanay | 8 Nisan 2026: Verilen firma ID listesinden hangilerinin yöneticisi olduğunu döner
-- SECURITY DEFINER ile çalışır — RLS bypass eder, anonim kullanıcılar da çağırabilir
CREATE OR REPLACE FUNCTION public.get_managed_firma_ids(firma_ids uuid[])
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(array_agg(DISTINCT firma_id), '{}')
  FROM kurumsal_firma_yoneticileri
  WHERE firma_id = ANY(firma_ids);
$$;
