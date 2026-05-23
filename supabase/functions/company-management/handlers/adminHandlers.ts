// Enes Doğanay | 23 Mayıs 2026: Admin firma yönetim action'ları
import { createAdminClient } from "../../_shared/supabaseAdmin.ts";
import { jsonResponse } from "../../_shared/cors.ts";
import { getAuthenticatedAdmin } from "../authHelper.ts";
import { buildAdminCompanyFields } from "../normalizers.ts";
import type { CompanyManagementPayload } from "../types.ts";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

const FIELDS =
    "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best";

/* ─── Admin: Logo güncelle ─── */
// Enes Doğanay | 13 Nisan 2026: Admin logo güncelleme — admin_epostalari ile yetkilendirme
export const handleAdminUpdateLogo = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<CompanyManagementPayload, { action: "admin_update_logo" }>,
) => {
    const auth = await getAuthenticatedAdmin(request, supabaseAdmin);
    if (auth instanceof Response) return auth;
    if (!payload.firmaID) {
        return jsonResponse({ error: "firmaID zorunludur." }, 400);
    }

    const { error } = await supabaseAdmin
        .from("firmalar")
        .update({ logo_url: payload.logo_url || null })
        .eq("firmaID", payload.firmaID);
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ success: true });
};

/* ─── Admin: Firma getir ─── */
// Enes Doğanay | 13 Nisan 2026: Admin firma getirme — firma detayını çeker
export const handleAdminGetCompany = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<CompanyManagementPayload, { action: "admin_get_company" }>,
) => {
    const auth = await getAuthenticatedAdmin(request, supabaseAdmin);
    if (auth instanceof Response) return auth;
    if (!payload.firmaID) {
        return jsonResponse({ error: "firmaID zorunludur." }, 400);
    }

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .select(FIELDS)
        .eq("firmaID", payload.firmaID)
        .single();
    if (error || !company) {
        return jsonResponse({ error: "Firma bulunamadı." }, 404);
    }
    return jsonResponse({ company, firmaId: company.firmaID });
};

/* ─── Admin: Firma güncelle ─── */
// Enes Doğanay | 13 Nisan 2026: Admin firma güncelleme — tüm alanları günceller
export const handleAdminUpdateCompany = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<
        CompanyManagementPayload,
        { action: "admin_update_company" }
    >,
) => {
    const auth = await getAuthenticatedAdmin(request, supabaseAdmin);
    if (auth instanceof Response) return auth;
    if (!payload.firmaID) {
        return jsonResponse({ error: "firmaID zorunludur." }, 400);
    }

    const fields = buildAdminCompanyFields(
        payload.company as Record<string, unknown>,
    );
    if (!fields.firma_adi) {
        return jsonResponse({ error: "Firma adı zorunludur." }, 400);
    }

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .update(fields)
        .eq("firmaID", payload.firmaID)
        .select(FIELDS)
        .single();
    if (error || !company) {
        return jsonResponse({
            error: error?.message || "Firma güncellenemedi.",
        }, 500);
    }
    return jsonResponse({ company, firmaId: company.firmaID });
};

/* ─── Admin: Firma ekle ─── */
// Enes Doğanay | 13 Nisan 2026: Admin yeni firma ekleme — firmalar tablosuna insert
export const handleAdminCreateCompany = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<
        CompanyManagementPayload,
        { action: "admin_create_company" }
    >,
) => {
    const auth = await getAuthenticatedAdmin(request, supabaseAdmin);
    if (auth instanceof Response) return auth;

    const fields = buildAdminCompanyFields(
        payload.company as Record<string, unknown>,
    );
    if (!fields.firma_adi) {
        return jsonResponse({ error: "Firma adı zorunludur." }, 400);
    }

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .insert({ ...fields, best: false })
        .select(FIELDS)
        .single();
    if (error || !company) {
        return jsonResponse(
            { error: error?.message || "Firma eklenemedi." },
            500,
        );
    }
    return jsonResponse({ company, firmaId: company.firmaID });
};

/* ─── Admin: Firma sil ─── */
// Enes Doğanay | 13 Nisan 2026: Admin firma silme — firmalar tablosundan delete
export const handleAdminDeleteCompany = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<
        CompanyManagementPayload,
        { action: "admin_delete_company" }
    >,
) => {
    const auth = await getAuthenticatedAdmin(request, supabaseAdmin);
    if (auth instanceof Response) return auth;
    if (!payload.firmaID) {
        return jsonResponse({ error: "firmaID zorunludur." }, 400);
    }

    const { error } = await supabaseAdmin
        .from("firmalar")
        .delete()
        .eq("firmaID", payload.firmaID);
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ success: true });
};
