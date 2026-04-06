// Enes Doganay | 6 Nisan 2026: Ihale yonetim Edge Function
// Aksiyonlar: list_my_tenders | create_tender | update_tender | delete_tender
import { createAdminClient } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

type IhalePayload =
    | { action: 'list_my_tenders' }
    | { action: 'create_tender'; tender: TenderInput }
    | { action: 'update_tender'; id: string; tender: TenderInput }
    | { action: 'delete_tender'; id: string };

interface TenderInput {
    baslik: string;
    aciklama?: string | null;
    kategori?: string | null;
    ihale_tipi?: string | null;
    butce_notu?: string | null;
    yayin_tarihi?: string | null;
    son_basvuru_tarihi?: string | null;
    durum?: 'draft' | 'canli' | 'kapali';
    basvuru_email?: string | null;
    referans_no?: string | null;
    il_ilce?: string | null;
}

// Enes Doganay | 6 Nisan 2026: Bos string -> null donusturur
const str = (v?: string | null): string | null => {
    const t = String(v || '').trim();
    return t || null;
};

// Enes Doganay | 6 Nisan 2026: Tarih dogrulama, gecersizse null doner
const safeDate = (v?: string | null): string | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
};

// Enes Doganay | 6 Nisan 2026: Bugunun tarihini YYYY-MM-DD formatinda doner
const today = (): string => new Date().toISOString().split('T')[0];

// Enes Doganay | 6 Nisan 2026: Durum degeri DB CHECK constraint ile uyumlu olmali
const VALID_DURUM = ['draft', 'canli', 'kapali'] as const;
const normalizeDurum = (v: unknown): string => {
    const d = String(v || '').toLowerCase().trim();
    if ((VALID_DURUM as readonly string[]).includes(d)) return d;
    return 'canli';
};

// Enes Doganay | 6 Nisan 2026: JWT'den kullanici kimligini ve firma_id bilgisini dogrular
const getAuthenticatedManager = async (
    request: Request,
    supabaseAdmin: ReturnType<typeof createAdminClient>
) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return { error: 'Unauthorized', status: 401 as const };

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return { error: 'Unauthorized', status: 401 as const };

    const { data: row, error: rowErr } = await supabaseAdmin
        .from('kurumsal_firma_yoneticileri')
        .select('firma_id, role')
        .eq('user_id', data.user.id)
        .maybeSingle();

    if (rowErr || !row?.firma_id) {
        return { error: 'Bu hesap icin yonetilen firma bulunamadi.', status: 403 as const };
    }

    return { user: data.user, firmaId: row.firma_id as string };
};

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const supabaseAdmin = createAdminClient();

    try {
        const authResult = await getAuthenticatedManager(request, supabaseAdmin);
        if ('error' in authResult) {
            return jsonResponse({ error: authResult.error }, authResult.status);
        }

        const { firmaId } = authResult;
        const payload: IhalePayload = await request.json();

        // ── Liste ──────────────────────────────────────────────────────────
        if (payload.action === 'list_my_tenders') {
            const { data, error } = await supabaseAdmin
                .from('firma_ihaleleri')
                .select('*')
                .eq('firma_id', firmaId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return jsonResponse({ tenders: data ?? [] });
        }

        // ── Olustur ────────────────────────────────────────────────────────
        if (payload.action === 'create_tender') {
            const t = payload.tender;
            if (!t?.baslik?.trim()) {
                return jsonResponse({ error: 'Ihale basligi zorunludur.' }, 400);
            }

            const row = {
                firma_id: firmaId,
                baslik: t.baslik.trim(),
                aciklama: str(t.aciklama),
                kategori: str(t.kategori),
                ihale_tipi: str(t.ihale_tipi),
                butce_notu: str(t.butce_notu),
                // Enes Doganay | 6 Nisan 2026: yayin_tarihi NOT NULL — bos ise bugunun tarihini kullan
                yayin_tarihi: safeDate(t.yayin_tarihi) ?? today(),
                son_basvuru_tarihi: safeDate(t.son_basvuru_tarihi),
                durum: normalizeDurum(t.durum),
                basvuru_email: str(t.basvuru_email),
                referans_no: str(t.referans_no),
                il_ilce: str(t.il_ilce),
            };

            const { data, error } = await supabaseAdmin
                .from('firma_ihaleleri')
                .insert(row)
                .select()
                .single();

            if (error) throw error;
            return jsonResponse({ tender: data }, 201);
        }

        // ── Guncelle ───────────────────────────────────────────────────────
        // Enes Doganay | 6 Nisan 2026: yayin_tarihi NOT NULL oldugu icin bos gelirse objeye dahil etmeyiz
        if (payload.action === 'update_tender') {
            if (!payload.id) return jsonResponse({ error: 'Ihale ID gerekli.' }, 400);

            const t = payload.tender;
            if (!t?.baslik?.trim()) return jsonResponse({ error: 'Ihale basligi zorunludur.' }, 400);

            const updateObj: Record<string, unknown> = {
                baslik: t.baslik.trim(),
                aciklama: str(t.aciklama),
                kategori: str(t.kategori),
                ihale_tipi: str(t.ihale_tipi),
                butce_notu: str(t.butce_notu),
                son_basvuru_tarihi: safeDate(t.son_basvuru_tarihi),
                durum: normalizeDurum(t.durum),
                basvuru_email: str(t.basvuru_email),
                referans_no: str(t.referans_no),
                il_ilce: str(t.il_ilce),
            };

            console.log('update durum received:', JSON.stringify(t.durum), '-> normalized:', updateObj.durum);

            // yayin_tarihi NOT NULL -> bos gelirse objeye ekleme, DB'deki mevcut deger korunur
            const parsedDate = safeDate(t.yayin_tarihi);
            if (parsedDate) {
                updateObj.yayin_tarihi = parsedDate;
            }

            const { data: updated, error: updErr } = await supabaseAdmin
                .from('firma_ihaleleri')
                .update(updateObj)
                .eq('id', payload.id)
                .eq('firma_id', firmaId)
                .select();

            if (updErr) throw updErr;
            if (!updated || updated.length === 0) {
                return jsonResponse({ error: 'Ihale bulunamadi veya bu firmaya ait degil.' }, 404);
            }
            return jsonResponse({ tender: updated[0] });
        }

        // ── Sil ────────────────────────────────────────────────────────────
        if (payload.action === 'delete_tender') {
            if (!payload.id) return jsonResponse({ error: 'Ihale ID gerekli.' }, 400);

            const { error } = await supabaseAdmin
                .from('firma_ihaleleri')
                .delete()
                .eq('id', payload.id)
                .eq('firma_id', firmaId);

            if (error) throw error;
            return jsonResponse({ success: true });
        }

        return jsonResponse({ error: 'Gecersiz aksiyon.' }, 400);

    } catch (err) {
        // Enes Doganay | 6 Nisan 2026: PostgrestError instanceof Error degil, .message ile yakala
        const message = (err as any)?.message || (typeof err === 'string' ? err : 'Bilinmeyen sunucu hatasi.');
        console.error('ihale-management error:', message, err);
        return jsonResponse({ error: message }, 500);
    }
});
