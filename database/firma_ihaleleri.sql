-- Enes Doğanay | 6 Nisan 2026: firma_ihaleleri tablosu — kurumsal firmalar kendi ihalelerini buraya yazar
-- Supabase Dashboard > SQL Editor'de bu dosyayı çalıştırın.

create table if not exists public.firma_ihaleleri (
    id              uuid primary key default gen_random_uuid(),
    firma_id        uuid not null references public.firmalar(firmaID) on delete cascade,
    baslik          text not null,
    aciklama        text,
    kategori        text,
    ihale_tipi      text,                   -- örn. 'Açık İhale', 'Davetli İhale'
    butce_notu      text,                   -- serbest metin: '100.000 - 250.000 TL'
    yayin_tarihi    date not null default current_date,
    son_basvuru_tarihi date,
    durum           text not null default 'canli'
                        check (durum in ('draft','canli','kapali')),
    is_featured     boolean not null default false,
    basvuru_email   text,
    referans_no     text,
    il_ilce         text,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- updated_at otomatik güncellensin
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists firma_ihaleleri_updated_at on public.firma_ihaleleri;
create trigger firma_ihaleleri_updated_at
    before update on public.firma_ihaleleri
    for each row execute procedure public.set_updated_at();

-- RLS
alter table public.firma_ihaleleri enable row level security;

-- Herkes yayında olan ihaleleri okuyabilir
create policy "public read canli/kapali"
    on public.firma_ihaleleri for select
    using (durum <> 'draft');

-- Yalnızca Edge Function (service_role) yazabilir / silip güncelleyebilir
-- (INSERT/UPDATE/DELETE Edge Function üzerinden service_role ile yapılır)
