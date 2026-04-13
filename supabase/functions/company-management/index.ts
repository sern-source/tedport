import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type CompanyManagementPayload =
    | { action: "get_my_company" }
    | {
        action: "update_my_company";
        company: {
            firma_adi: string;
            web_sitesi?: string | null;
            category_name?: string | null;
            description?: string | null;
            firma_turu?: string | null;
            telefon?: string | null;
            eposta?: string | null;
            adres?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            ana_sektor?: string | null;
            urun_kategorileri?: unknown;
            logo_url?: string | null;
            il_ilce?: string | null;
        };
    }
    /* Enes Doğanay | 13 Nisan 2026: Admin logo güncelleme action'ı */
    | {
        action: "admin_update_logo";
        firmaID: string;
        logo_url: string | null;
    }
    /* Enes Doğanay | 13 Nisan 2026: Admin firma getirme action'ı */
    | {
        action: "admin_get_company";
        firmaID: string;
    }
    /* Enes Doğanay | 13 Nisan 2026: Admin firma güncelleme action'ı */
    | {
        action: "admin_update_company";
        firmaID: string;
        company: {
            firma_adi: string;
            web_sitesi?: string | null;
            category_name?: string | null;
            description?: string | null;
            firma_turu?: string | null;
            telefon?: string | null;
            eposta?: string | null;
            adres?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            ana_sektor?: string | null;
            urun_kategorileri?: unknown;
            logo_url?: string | null;
            il_ilce?: string | null;
        };
    }
    /* Enes Doğanay | 13 Nisan 2026: Admin yeni firma ekleme action'ı */
    | {
        action: "admin_create_company";
        company: {
            firma_adi: string;
            web_sitesi?: string | null;
            category_name?: string | null;
            description?: string | null;
            firma_turu?: string | null;
            telefon?: string | null;
            eposta?: string | null;
            adres?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            ana_sektor?: string | null;
            urun_kategorileri?: unknown;
            logo_url?: string | null;
            il_ilce?: string | null;
        };
    }
    /* Enes Doğanay | 13 Nisan 2026: Admin firma silme action'ı */
    | {
        action: "admin_delete_company";
        firmaID: string;
    };

const normalizeWebsiteUrl = (value?: string | null) => {
    const trimmedValue = String(value || "").trim();
    if (!trimmedValue) {
        return null;
    }

    return /^https?:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`;
};

const normalizeOptionalString = (value?: string | null) => {
    const trimmedValue = String(value || "").trim();
    return trimmedValue || null;
};

const normalizeCoordinate = (value?: number | null) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

const getAuthenticatedManager = async (
    request: Request,
    supabaseAdmin: ReturnType<typeof createAdminClient>,
) => {
    const authorizationHeader = request.headers.get("Authorization");
    if (!authorizationHeader) {
        return { error: "Unauthorized", status: 401 as const };
    }

    const accessToken = authorizationHeader.replace("Bearer ", "");
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data.user) {
        return { error: "Unauthorized", status: 401 as const };
    }

    const { data: managerRow, error: managerError } = await supabaseAdmin
        .from("kurumsal_firma_yoneticileri")
        .select("firma_id, role")
        .eq("user_id", data.user.id)
        .maybeSingle();

    if (managerError || !managerRow?.firma_id) {
        return {
            error: "Bu hesap için yönetilen firma bulunamadı.",
            status: 403 as const,
        };
    }

    return {
        user: data.user,
        managerRow,
    };
};

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const supabaseAdmin = createAdminClient();
    const payload = await request.json() as CompanyManagementPayload;

    /* Enes Doğanay | 13 Nisan 2026: Admin logo güncelleme — admin_epostalari ile yetkilendirme */
    if (payload.action === "admin_update_logo") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authErr } = await supabaseAdmin.auth
            .getUser(token);
        if (authErr || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const { data: adminRow } = await supabaseAdmin
            .from("admin_epostalari")
            .select("email")
            .eq("email", (authData.user.email || "").trim().toLowerCase())
            .maybeSingle();
        if (!adminRow) return jsonResponse({ error: "Forbidden" }, 403);

        if (!payload.firmaID) {
            return jsonResponse({ error: "firmaID zorunludur." }, 400);
        }

        const { error: updateErr } = await supabaseAdmin
            .from("firmalar")
            .update({ logo_url: payload.logo_url || null })
            .eq("firmaID", payload.firmaID);
        if (updateErr) return jsonResponse({ error: updateErr.message }, 500);

        return jsonResponse({ success: true });
    }

    /* Enes Doğanay | 13 Nisan 2026: Admin firma getirme — firma detayını çeker */
    if (payload.action === "admin_get_company") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authErr } = await supabaseAdmin.auth
            .getUser(token);
        if (authErr || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }
        const { data: adminRow } = await supabaseAdmin.from("admin_epostalari")
            .select("email").eq(
                "email",
                (authData.user.email || "").trim().toLowerCase(),
            ).maybeSingle();
        if (!adminRow) return jsonResponse({ error: "Forbidden" }, 403);
        if (!payload.firmaID) {
            return jsonResponse({ error: "firmaID zorunludur." }, 400);
        }

        const { data: company, error } = await supabaseAdmin
            .from("firmalar")
            .select(
                "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best",
            )
            .eq("firmaID", payload.firmaID)
            .single();
        if (error || !company) {
            return jsonResponse({ error: "Firma bulunamadı." }, 404);
        }
        return jsonResponse({ company, firmaId: company.firmaID });
    }

    /* Enes Doğanay | 13 Nisan 2026: Admin firma güncelleme — tüm alanları günceller */
    if (payload.action === "admin_update_company") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authErr } = await supabaseAdmin.auth
            .getUser(token);
        if (authErr || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }
        const { data: adminRow } = await supabaseAdmin.from("admin_epostalari")
            .select("email").eq(
                "email",
                (authData.user.email || "").trim().toLowerCase(),
            ).maybeSingle();
        if (!adminRow) return jsonResponse({ error: "Forbidden" }, 403);
        if (!payload.firmaID) {
            return jsonResponse({ error: "firmaID zorunludur." }, 400);
        }

        const nextCompany = payload.company || {};
        const companyName = String(nextCompany.firma_adi || "").trim();
        if (!companyName) {
            return jsonResponse({ error: "Firma adı zorunludur." }, 400);
        }

        const updatePayload = {
            firma_adi: companyName,
            web_sitesi: normalizeWebsiteUrl(nextCompany.web_sitesi),
            category_name: normalizeOptionalString(nextCompany.category_name) ||
                "Kurumsal Üye",
            description: normalizeOptionalString(nextCompany.description),
            firma_turu: normalizeOptionalString(nextCompany.firma_turu),
            telefon: normalizeOptionalString(nextCompany.telefon),
            eposta:
                normalizeOptionalString(nextCompany.eposta)?.toLowerCase() ||
                null,
            adres: normalizeOptionalString(nextCompany.adres),
            latitude: normalizeCoordinate(nextCompany.latitude),
            longitude: normalizeCoordinate(nextCompany.longitude),
            ana_sektor: normalizeOptionalString(nextCompany.ana_sektor),
            urun_kategorileri: JSON.stringify(
                Array.isArray(nextCompany.urun_kategorileri)
                    ? nextCompany.urun_kategorileri
                    : [],
            ),
            logo_url: normalizeOptionalString(nextCompany.logo_url),
            il_ilce: normalizeOptionalString(nextCompany.il_ilce),
        };

        const { data: company, error } = await supabaseAdmin
            .from("firmalar")
            .update(updatePayload)
            .eq("firmaID", payload.firmaID)
            .select(
                "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best",
            )
            .single();
        if (error || !company) {
            return jsonResponse({
                error: error?.message || "Firma güncellenemedi.",
            }, 500);
        }
        return jsonResponse({ company, firmaId: company.firmaID });
    }

    /* Enes Doğanay | 13 Nisan 2026: Admin yeni firma ekleme — firmalar tablosuna insert */
    if (payload.action === "admin_create_company") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authErr } = await supabaseAdmin.auth
            .getUser(token);
        if (authErr || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }
        const { data: adminRow } = await supabaseAdmin.from("admin_epostalari")
            .select("email").eq(
                "email",
                (authData.user.email || "").trim().toLowerCase(),
            ).maybeSingle();
        if (!adminRow) return jsonResponse({ error: "Forbidden" }, 403);

        const nextCompany = payload.company || {};
        const companyName = String(nextCompany.firma_adi || "").trim();
        if (!companyName) {
            return jsonResponse({ error: "Firma adı zorunludur." }, 400);
        }

        const insertPayload = {
            firma_adi: companyName,
            best: false,
            web_sitesi: normalizeWebsiteUrl(nextCompany.web_sitesi),
            category_name: normalizeOptionalString(nextCompany.category_name) ||
                "Kurumsal Üye",
            description: normalizeOptionalString(nextCompany.description),
            firma_turu: normalizeOptionalString(nextCompany.firma_turu),
            telefon: normalizeOptionalString(nextCompany.telefon),
            eposta:
                normalizeOptionalString(nextCompany.eposta)?.toLowerCase() ||
                null,
            adres: normalizeOptionalString(nextCompany.adres),
            latitude: normalizeCoordinate(nextCompany.latitude),
            longitude: normalizeCoordinate(nextCompany.longitude),
            ana_sektor: normalizeOptionalString(nextCompany.ana_sektor),
            urun_kategorileri: JSON.stringify(
                Array.isArray(nextCompany.urun_kategorileri)
                    ? nextCompany.urun_kategorileri
                    : [],
            ),
            logo_url: normalizeOptionalString(nextCompany.logo_url),
            il_ilce: normalizeOptionalString(nextCompany.il_ilce),
        };

        const { data: company, error } = await supabaseAdmin
            .from("firmalar")
            .insert(insertPayload)
            .select(
                "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best",
            )
            .single();
        if (error || !company) {
            return jsonResponse({
                error: error?.message || "Firma eklenemedi.",
            }, 500);
        }
        return jsonResponse({ company, firmaId: company.firmaID });
    }

    /* Enes Doğanay | 13 Nisan 2026: Admin firma silme — firmalar tablosundan delete */
    if (payload.action === "admin_delete_company") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authErr } = await supabaseAdmin.auth
            .getUser(token);
        if (authErr || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }
        const { data: adminRow } = await supabaseAdmin.from("admin_epostalari")
            .select("email").eq(
                "email",
                (authData.user.email || "").trim().toLowerCase(),
            ).maybeSingle();
        if (!adminRow) return jsonResponse({ error: "Forbidden" }, 403);
        if (!payload.firmaID) {
            return jsonResponse({ error: "firmaID zorunludur." }, 400);
        }

        const { error } = await supabaseAdmin
            .from("firmalar")
            .delete()
            .eq("firmaID", payload.firmaID);
        if (error) return jsonResponse({ error: error.message }, 500);
        return jsonResponse({ success: true });
    }

    const managerResult = await getAuthenticatedManager(request, supabaseAdmin);

    if ("error" in managerResult) {
        return jsonResponse(
            { error: managerResult.error },
            managerResult.status,
        );
    }

    if (payload.action === "get_my_company") {
        const { data: company, error } = await supabaseAdmin
            .from("firmalar")
            .select(
                "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best",
            )
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
    }

    const nextCompany = payload.company || {};
    const companyName = String(nextCompany.firma_adi || "").trim();
    if (!companyName) {
        return jsonResponse({ error: "Firma adı zorunludur." }, 400);
    }

    const updatePayload = {
        firma_adi: companyName,
        web_sitesi: normalizeWebsiteUrl(nextCompany.web_sitesi),
        category_name: normalizeOptionalString(nextCompany.category_name) ||
            "Kurumsal Üye",
        description: normalizeOptionalString(nextCompany.description),
        firma_turu: normalizeOptionalString(nextCompany.firma_turu),
        telefon: normalizeOptionalString(nextCompany.telefon),
        eposta: normalizeOptionalString(nextCompany.eposta)?.toLowerCase() ||
            null,
        adres: normalizeOptionalString(nextCompany.adres),
        latitude: normalizeCoordinate(nextCompany.latitude),
        longitude: normalizeCoordinate(nextCompany.longitude),
        ana_sektor: normalizeOptionalString(nextCompany.ana_sektor),
        urun_kategorileri: JSON.stringify(
            Array.isArray(nextCompany.urun_kategorileri)
                ? nextCompany.urun_kategorileri
                : [],
        ),
        logo_url: normalizeOptionalString(nextCompany.logo_url),
        il_ilce: normalizeOptionalString(nextCompany.il_ilce),
    };

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .update(updatePayload)
        .eq("firmaID", managerResult.managerRow.firma_id)
        .select(
            "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best",
        )
        .single();

    if (error || !company) {
        return jsonResponse({
            error: error?.message || "Firma kaydı güncellenemedi.",
        }, 500);
    }

    await supabaseAdmin
        .from("profiles")
        .update({
            company_name: company.firma_adi,
            phone: company.telefon,
            email: company.eposta,
        })
        .eq("id", managerResult.user.id);

    return jsonResponse({
        company,
        firmaId: managerResult.managerRow.firma_id,
    });
});
