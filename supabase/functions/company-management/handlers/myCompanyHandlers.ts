// Enes Doğanay | 23 Mayıs 2026: Kendi firma verisi — getir ve güncelle
import { createAdminClient } from "../../_shared/supabaseAdmin.ts";
import { jsonResponse } from "../../_shared/cors.ts";
import { getAuthenticatedManager } from "../authHelper.ts";
import { buildCompanyFields } from "../normalizers.ts";
import type { CompanyManagementPayload } from "../types.ts";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

const FIELDS =
    "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best";
const FIELDS_EXTENDED =
    "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best, pending_logo_url, pending_logo_red_notu, arama_etiketleri";

// Enes Doğanay | 23 Mayıs 2026: Yöneticinin bağlı firmasını çeker
export const handleGetMyCompany = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    _payload: Extract<CompanyManagementPayload, { action: "get_my_company" }>,
) => {
    const managerResult = await getAuthenticatedManager(request, supabaseAdmin);
    if ("error" in managerResult) {
        return jsonResponse(
            { error: managerResult.error },
            managerResult.status,
        );
    }

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .select(FIELDS)
        .eq("firmaID", managerResult.managerRow.firma_id)
        .single();

    if (error || !company) {
        return jsonResponse(
            { error: "Yönetilen firma kaydı bulunamadı." },
            404,
        );
    }
    return jsonResponse({
        company,
        firmaId: managerResult.managerRow.firma_id,
    });
};

// Enes Doğanay | 23 Mayıs 2026: Yöneticinin bağlı firmasını günceller — logo dahil değil
export const handleUpdateMyCompany = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<CompanyManagementPayload, { action: "update_my_company" }>,
) => {
    const managerResult = await getAuthenticatedManager(request, supabaseAdmin);
    if ("error" in managerResult) {
        return jsonResponse(
            { error: managerResult.error },
            managerResult.status,
        );
    }

    const nextCompany = payload.company || {};
    const fields = buildCompanyFields(nextCompany as Record<string, unknown>);
    if (!fields.firma_adi) {
        return jsonResponse({ error: "Firma adı zorunludur." }, 400);
    }

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .update(fields)
        .eq("firmaID", managerResult.managerRow.firma_id)
        .select(FIELDS_EXTENDED)
        .single();

    if (error || !company) {
        return jsonResponse(
            { error: error?.message || "Firma kaydı güncellenemedi." },
            500,
        );
    }

    // Enes Doğanay | 23 Mayıs 2026: Profiles tablosunda yalnızca company_name güncellenir
    await supabaseAdmin
        .from("profiles")
        .update({ company_name: company.firma_adi })
        .eq("id", managerResult.user.id);

    return jsonResponse({
        company,
        firmaId: managerResult.managerRow.firma_id,
    });
};
