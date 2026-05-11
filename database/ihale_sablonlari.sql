-- Enes Doğanay | 11 Mayıs 2026: Firma bazlı ihale şablonları

create table if not exists ihale_sablonlari (
    id          uuid         primary key default gen_random_uuid(),
    firma_id    uuid         not null references firmalar("firmaID") on delete cascade,
    sablon_adi  text         not null,
    baslik      text         not null default '',
    aciklama    text         default '',
    ihale_tipi  text         default 'Açık İhale',
    kdv_durumu  text         default 'haric',
    teslim_suresi text       default '',
    teslim_il   text         default '',
    teslim_ilce text         default '',
    gereksinimler jsonb      default '[]',
    created_at  timestamptz  default now()
);

alter table ihale_sablonlari enable row level security;

-- Firma (sahip veya ekip üyesi) kendi şablonlarını görebilir
create policy "sablon_goruntule"
on ihale_sablonlari for select
using (
    firma_id::text in (
        select firma_id from kurumsal_firma_yoneticileri
        where user_id = auth.uid()
    )
);

-- Firma kendi şablonlarını ekleyebilir
create policy "sablon_ekle"
on ihale_sablonlari for insert
with check (
    firma_id::text in (
        select firma_id from kurumsal_firma_yoneticileri
        where user_id = auth.uid()
    )
);

-- Firma kendi şablonlarını silebilir
create policy "sablon_sil"
on ihale_sablonlari for delete
using (
    firma_id::text in (
        select firma_id from kurumsal_firma_yoneticileri
        where user_id = auth.uid()
    )
);
