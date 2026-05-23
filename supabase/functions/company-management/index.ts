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
    }
    /* Enes Doğanay | 23 Mayıs 2026: Teklif İste — firma + ekibe bildirim maili */
    | {
        action: "send_quote_request_email";
        firma_id: string;
        requester_name: string;
        konu: string;
        mesaj: string;
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

const normalizeCoordinate = (value?: number | string | null) => {
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

    /* Enes Doğanay | 23 Mayıs 2026: Teklif İste — firma kayıtlı maili + teklif_yonetimi yetkili ekip üyelerine bildirim */
    if (payload.action === "send_quote_request_email") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
        const token = authHeader.replace("Bearer ", "");
        const { data: authData, error: authErr } = await supabaseAdmin.auth
            .getUser(token);
        if (authErr || !authData.user) {
            return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const firmaId = String(payload.firma_id || "").trim();
        if (!firmaId) {
            return jsonResponse({ error: "firma_id zorunludur." }, 400);
        }

        const resendApiKey = Deno.env.get("RESEND_API_KEY");
        const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
        if (!resendApiKey || !fromEmail) return jsonResponse({ success: true }); // env eksikse sessizce geç

        // 1. Firma kayıtlı e-postası + adı
        const { data: firma } = await supabaseAdmin
            .from("firmalar")
            .select("firma_adi, eposta")
            .eq("firmaID", firmaId)
            .maybeSingle();
        const firmaAdi = String(firma?.firma_adi || "Firma").trim();
        const firmaEposta = String(firma?.eposta || "").trim().toLowerCase();

        // 2. Teklif yönetimi yetkili ekip üyeleri
        const { data: ekipRows } = await supabaseAdmin
            .from("kurumsal_firma_yoneticileri")
            .select("user_id, role, page_permissions")
            .eq("firma_id", firmaId);

        // Enes Doğanay | 23 Mayıs 2026: owner/admin rolleri page_permissions'dan bağımsız olarak dahil edilmeli
        const authorizedUserIds = (ekipRows || [])
            .filter((
                m: {
                    role?: string;
                    page_permissions?: { teklif_yonetimi?: boolean };
                },
            ) => m.role === "owner" ||
                m.role === "admin" ||
                m.page_permissions?.teklif_yonetimi === true
            )
            .map((m: { user_id: string }) => m.user_id);

        // Enes Doğanay | 23 Mayıs 2026: profiles.email yerine auth.users'dan çek — profiles.email bazı üyeler için null olabilir
        let teamEmails: string[] = [];
        for (const uid of authorizedUserIds) {
            try {
                const { data: authUser } = await supabaseAdmin.auth.admin
                    .getUserById(uid);
                const email = (authUser?.user?.email || "").trim().toLowerCase();
                if (email) teamEmails.push(email);
            } catch {
                // kullanıcı bulunamazsa atla
            }
        }

        // 3. Benzersiz alıcı listesi
        const allEmails = [
            ...new Set([firmaEposta, ...teamEmails].filter(Boolean)),
        ];
        if (allEmails.length === 0) return jsonResponse({ success: true });

        // 4. E-posta şablonu
        const safe = (s: string) =>
            String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
                .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

        const safeRequester = safe(payload.requester_name);
        const safeKonu = safe(payload.konu);
        const safeMesaj = safe(payload.mesaj);
        const safeFirmaAdi = safe(firmaAdi);
        const panelUrl = "https://tedport.com/firma-profil?tab=teklifler";

        const html = `<!DOCTYPE html>
<html lang="tr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  @media only screen and (max-width:620px) {
    .email-wrap { width:100% !important; padding:20px 8px !important; }
    .email-container { width:100% !important; }
    .section-pad { padding-left:20px !important; padding-right:20px !important; }
    .btn-td { text-align:center !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f0fdf4;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f0fdf4">
  <tr>
    <td class="email-wrap" align="center" style="padding:40px 16px;">
      <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">

        <!-- HEADER -->
        <tr>
          <td bgcolor="#064e3b" style="background-color:#064e3b; background-image:linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%); border-radius:16px 16px 0 0; padding:32px 40px 28px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="middle">
                  <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:20px; font-weight:bold; color:#ffffff;">Tedport</p>
                  <p style="margin:3px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#6ee7b7; text-transform:uppercase; letter-spacing:1px;">Tedarik Portali</p>
                </td>
                <td align="right" valign="middle">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td bgcolor="#065f46" style="background-color:#065f46; border-radius:20px; padding:5px 14px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#a7f3d0;">TEKLIF TALEBI</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:26px; font-weight:bold; color:#ffffff; line-height:1.25;">Yeni bir teklif<br>talebi aldınız!</p>
            <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#6ee7b7; line-height:1.6;"><strong style="color:#ffffff;">${safeRequester}</strong>, Tedport üzerinden firmanızdan teklif talep etti.</p>
          </td>
        </tr>

        <!-- WHITE BODY -->
        <tr>
          <td bgcolor="#ffffff" style="background-color:#ffffff; border-radius:0 0 16px 16px; padding:0 0 32px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">

              <!-- Talep kartı -->
              <tr>
                <td class="section-pad" style="padding:28px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #bbf7d0; border-radius:12px;">
                    <tr>
                      <td bgcolor="#f0fdf4" style="background-color:#f0fdf4; border-radius:10px; padding:20px 22px;">
                        <p style="margin:0 0 4px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#059669; text-transform:uppercase; letter-spacing:1.5px;">TEKLIF KONUSU</p>
                        <p style="margin:0 0 16px 0; font-family:Arial,Helvetica,sans-serif; font-size:18px; font-weight:bold; color:#0f172a; line-height:1.35;">${safeKonu}</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td bgcolor="#dcfce7" style="background-color:#dcfce7; border-radius:20px; padding:4px 12px;">
                              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#15803d;">Yeni Talep</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Talep sahibi -->
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:9px; padding:14px 18px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="44" valign="middle">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="40" height="40" bgcolor="#047857" style="background-color:#047857; border-radius:8px; text-align:center; vertical-align:middle;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:18px; line-height:40px; text-align:center; color:#ffffff;">&#128100;</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding-left:12px;" valign="middle">
                              <p style="margin:0 0 2px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#94a3b8; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Teklif Talep Eden</p>
                              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:bold; color:#0f172a;">${safeRequester}</p>
                            </td>
                            <td align="right" valign="middle">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td bgcolor="#f0fdf4" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:20px; padding:4px 12px;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#065f46; font-weight:bold;">Tedport Üyesi</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Mesaj önizleme -->
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 8px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">MESAJ</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#334155; line-height:1.6; font-style:italic;">&ldquo;${safeMesaj}&rdquo;</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td class="section-pad btn-td" align="center" style="padding:28px 32px 0 32px; text-align:center;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${panelUrl}" style="height:52px;v-text-anchor:middle;width:340px;" arcsize="17%" strokecolor="#047857" fillcolor="#047857">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">Teklif Talebini Goruntuле</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${panelUrl}" style="display:inline-block; background-color:#047857; color:#ffffff; text-decoration:none; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; padding:15px 36px; border-radius:10px; mso-hide:all;">Teklif Talebini Görüntüle &rarr;</a>
                  <!--<![endif]-->
                  <p style="margin:12px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#94a3b8; text-align:center; line-height:1.7;">Ya da bu linki tarayıcınıza kopyalayın:<br><a href="${panelUrl}" style="color:#059669; font-size:11px; word-break:break-all;">${panelUrl}</a></p>
                </td>
              </tr>

              <!-- Adımlar -->
              <tr>
                <td class="section-pad" style="padding:24px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:10px; padding:18px 20px;">
                        <p style="margin:0 0 12px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#065f46;">Nasıl yanıt veririm?</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">1.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Yukarıdaki butona tıklayarak Teklif Talepleri sayfanıza gidin.</p></td>
                          </tr>
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">2.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Gelen talebi inceleyin; kalemler, dosyalar ve detaylara bakın.</p></td>
                          </tr>
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">3.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Sohbet üzerinden mesaj gönderin veya teklifi yanıtlayın.</p></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="section-pad" style="padding:24px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="border-top:1px solid #e2e8f0; padding-top:20px;" colspan="2"></td>
                    </tr>
                    <tr>
                      <td valign="top">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#94a3b8; line-height:1.7;">Bu e-posta <strong style="color:#64748b;">${safeFirmaAdi}</strong> firması adına<br>Tedport tarafından otomatik olarak gönderilmiştir.<br>Sorularınız için <a href="mailto:info@tedport.com" style="color:#059669; text-decoration:none;">info@tedport.com</a></p>
                      </td>
                      <td align="right" valign="top" style="padding-left:16px; white-space:nowrap;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#065f46;">Tedport</p>
                        <p style="margin:2px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#94a3b8;">tedport.com</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

        const subject = `${safeRequester} teklif talebinde bulundu — Tedport`;
        for (const email of allEmails) {
            const resp = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [email],
                    subject,
                    html,
                }),
            });
            if (!resp.ok) {
                const body = await resp.text();
                console.error(
                    "Teklif talebi maili gönderilemedi:",
                    email,
                    body,
                );
            }
        }
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

    // Enes Doğanay | 18 Mayıs 2026: logo_url bu payload'a dahil edilmez —
    // Logo yönetimi pending/onay akışı üzerinden yürür (uploadLogoToPending → admin onay).
    // Dahil edilmesi durumunda, panel eski logo_url değeriyle kaydedilince onaylı logo sıfırlanır.
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
        il_ilce: normalizeOptionalString(nextCompany.il_ilce),
    };

    const { data: company, error } = await supabaseAdmin
        .from("firmalar")
        .update(updatePayload)
        .eq("firmaID", managerResult.managerRow.firma_id)
        .select(
            "firmaID, firma_adi, web_sitesi, category_name, description, firma_turu, telefon, eposta, adres, latitude, longitude, ana_sektor, urun_kategorileri, logo_url, il_ilce, best, pending_logo_url, pending_logo_red_notu, arama_etiketleri",
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
