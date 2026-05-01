import {
    createAdminClient,
    createAnonClient,
} from "../_shared/supabaseAdmin.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type CorporateAction = "submit" | "list" | "review";

// Enes Doğanay | 6 Nisan 2026: Kurumsal basvuru payload'lari edge function icinde tiplenir
type CorporateSubmitPayload = {
    action: "submit";
    applicantFirstName: string;
    applicantLastName: string;
    applicantTitle?: string;
    companyName: string;
    listedCompanyName?: string;
    websiteUrl?: string;
    corporateEmail: string;
    phone: string;
    taxOffice?: string;
    taxNumber?: string;
    companyAddress?: string;
    verificationNote?: string;
};

type CorporateReviewPayload = {
    action: "review";
    applicationId: number;
    decision: "approve" | "reject" | "needs_info";
    reviewNote?: string;
};

type CorporateListPayload = {
    action: "list";
};

const toError = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error) {
        return error;
    }

    if (error && typeof error === "object" && "message" in error) {
        return new Error(
            String((error as { message?: unknown }).message || fallbackMessage),
        );
    }

    return new Error(fallbackMessage);
};

const normalizeWebsiteUrl = (value?: string) => {
    if (!value) {
        return null;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return null;
    }

    return /^https?:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`;
};

// Enes Doğanay | 6 Nisan 2026: Kurumsal e-posta ve zorunlu alanlar function seviyesinde de dogrulanir
const validateCorporateSubmission = (payload: CorporateSubmitPayload) => {
    const requiredFields: Array<[string, string]> = [
        [payload.applicantFirstName, "Ad alanı zorunludur."],
        [payload.applicantLastName, "Soyad alanı zorunludur."],
        [payload.companyName, "Şirket adı zorunludur."],
        [payload.corporateEmail, "Kurumsal e-posta zorunludur."],
        [payload.phone, "Telefon alanı zorunludur."],
    ];

    for (const [value, message] of requiredFields) {
        if (!String(value || "").trim()) {
            return message;
        }
    }

    if (!String(payload.corporateEmail || "").includes("@")) {
        return "Geçerli bir e-posta adresi girin.";
    }

    return "";
};

const renderReviewEmail = ({ application, decision, actionLink, reviewNote }: {
    application: Record<string, unknown>;
    decision: "approve" | "reject" | "needs_info";
    actionLink?: string;
    reviewNote?: string;
}) => {
    const companyName = String(application.company_name || "Şirketiniz");
    const applicantName = `${String(application.applicant_first_name || "")} ${
        String(application.applicant_last_name || "")
    }`.trim();
    const safe = (s: unknown) =>
        String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
            />/g,
            "&gt;",
        ).replace(/"/g, "&quot;");
    const safeName = safe(applicantName || "Tedport kullanıcısı");
    const safeCompany = safe(companyName);
    const safeNote = reviewNote ? safe(reviewNote) : "";

    const emailWrapper = (
        headerBg: string,
        headerGradient: string,
        badgeBg: string,
        badgeText: string,
        badgeColor: string,
        headingColor: string,
        heading: string,
        subheading: string,
        bodyHtml: string,
    ) => `<!DOCTYPE html>
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
<body style="margin:0; padding:0; background-color:#f1f5f9;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f5f9">
  <tr>
    <td class="email-wrap" align="center" style="padding:40px 16px;">
      <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">
        <!-- HEADER -->
        <tr>
          <td bgcolor="${headerBg}" style="background-color:${headerBg}; background-image:${headerGradient}; border-radius:16px 16px 0 0; padding:30px 40px 26px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="middle">
                  <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:20px; font-weight:bold; color:#ffffff;">Tedport</p>
                  <p style="margin:3px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:${headingColor}; text-transform:uppercase; letter-spacing:1px;">Tedarik Portali</p>
                </td>
                <td align="right" valign="middle">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td bgcolor="${badgeBg}" style="background-color:${badgeBg}; border-radius:20px; padding:5px 14px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:${badgeColor};">${badgeText}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:22px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:25px; font-weight:bold; color:#ffffff; line-height:1.3;">${heading}</p>
            <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:${headingColor}; line-height:1.6;">${subheading}</p>
          </td>
        </tr>
        <!-- WHITE BODY -->
        <tr>
          <td bgcolor="#ffffff" style="background-color:#ffffff; border-radius:0 0 16px 16px; padding:0 0 32px 0;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:20px 0 0 0;">
            <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#94a3b8;">Tedport Teknoloji A.S. &nbsp;|&nbsp; <a href="https://tedport.com" style="color:#94a3b8; text-decoration:none;">tedport.com</a></p>
            <p style="margin:6px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#cbd5e1;">Sorulariniz icin <a href="mailto:info@tedport.com" style="color:#94a3b8;">info@tedport.com</a> adresine yazabilirsiniz.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    if (decision === "approve") {
        const body = `
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <!-- Greeting card -->
              <tr>
                <td class="section-pad" style="padding:28px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #bbf7d0; border-radius:12px;">
                    <tr>
                      <td bgcolor="#f0fdf4" style="background-color:#f0fdf4; border-radius:10px; padding:20px 22px;">
                        <p style="margin:0 0 6px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#15803d; text-transform:uppercase; letter-spacing:1.5px;">KURUMSAL HESAP HAZIR</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:17px; font-weight:bold; color:#0f172a; line-height:1.4;">Merhaba ${safeName},</p>
                        <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#475569; line-height:1.7;"><strong>${safeCompany}</strong> adina yaptiginiz kurumsal basvuru onaylandi. Hesabiniz olusturuldu ve giriş yapabilirsiniz.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Info box -->
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:9px; padding:14px 18px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#334155; line-height:1.7;">Asagidaki butona tiklayarak yeni sifrenizi belirleyin. Sifrenizi olusturduktan sonra bu e-posta adresiyle kurumsal giriste kullanabilirsiniz.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${
            safeNote
                ? `
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-left:4px solid #22c55e; border-radius:0 10px 10px 0;">
                    <tr>
                      <td bgcolor="#f0fdf4" style="background-color:#f0fdf4; padding:14px 18px;">
                        <p style="margin:0 0 4px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#15803d; text-transform:uppercase; letter-spacing:0.5px;">NOT</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#1e293b; line-height:1.7;">${safeNote}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
                : ""
        }
              <!-- CTA -->
              <tr>
                <td class="section-pad btn-td" style="padding:28px 32px 0 32px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${
            actionLink || "#"
        }" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="50%" stroke="f" fillcolor="#15803d">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">Sifremi Belirle</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${
            actionLink || "#"
        }" style="background-color:#15803d; border-radius:999px; color:#ffffff; display:inline-block; font-family:Arial,Helvetica,sans-serif; font-size:14px; font-weight:bold; line-height:46px; text-align:center; text-decoration:none; width:200px; -webkit-text-size-adjust:none;">Sifremi Belirle</a>
                  <!--<![endif]-->
                </td>
              </tr>
            </table>`;
        return {
            subject: `Tedport Kurumsal Başvurunuz Onaylandı | ${companyName}`,
            html: emailWrapper(
                "#14532d",
                "linear-gradient(135deg,#14532d 0%,#15803d 55%,#22c55e 100%)",
                "#166534",
                "BASVURU ONAYLANDI",
                "#bbf7d0",
                "#bbf7d0",
                "Kurumsal başvurunuz<br>onaylandı!",
                `<strong>${safeCompany}</strong> için Tedport kurumsal hesabınız hazırlandı.`,
                body,
            ),
        };
    }

    if (decision === "needs_info") {
        const body = `
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="section-pad" style="padding:28px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #fed7aa; border-radius:12px;">
                    <tr>
                      <td bgcolor="#fff7ed" style="background-color:#fff7ed; border-radius:10px; padding:20px 22px;">
                        <p style="margin:0 0 6px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#c2410c; text-transform:uppercase; letter-spacing:1.5px;">EK BILGI GEREKLI</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:17px; font-weight:bold; color:#0f172a; line-height:1.4;">Merhaba ${safeName},</p>
                        <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#475569; line-height:1.7;"><strong>${safeCompany}</strong> adina yaptiginiz kurumsal basvuru incelenmis olup degerlendirmeyi tamamlayabilmemiz icin sizden ek bilgi almamiz gerekmektedir.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${
            safeNote
                ? `
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-left:4px solid #d97706; border-radius:0 10px 10px 0;">
                    <tr>
                      <td bgcolor="#fffbeb" style="background-color:#fffbeb; padding:14px 18px;">
                        <p style="margin:0 0 4px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#92400e; text-transform:uppercase; letter-spacing:0.5px;">TALEP EDILEN BILGI / BELGE</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#1e293b; line-height:1.7;">${safeNote}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
                : ""
        }
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:9px; padding:14px 18px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#334155; line-height:1.7;">Bu e-postaya dogrudan yanit vererek veya <a href="mailto:info@tedport.com" style="color:#d97706;">info@tedport.com</a> adresine yazarak bilgilerinizi iletebilirsiniz.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`;
        return {
            subject:
                `Başvurunuz İçin Ek Bilgi Gerekli | ${companyName} – Tedport`,
            html: emailWrapper(
                "#92400e",
                "linear-gradient(135deg,#78350f 0%,#b45309 55%,#d97706 100%)",
                "#a16207",
                "EK BILGI BEKLENIYOR",
                "#fef3c7",
                "#fde68a",
                "Basvurunuz için ek<br>bilgi gerekiyor",
                `<strong>${safeCompany}</strong> başvurusu değerlendirme aşamasında.`,
                body,
            ),
        };
    }

    // reject
    const body = `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td class="section-pad" style="padding:28px 32px 0 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #fecaca; border-radius:12px;">
                <tr>
                  <td bgcolor="#fff1f2" style="background-color:#fff1f2; border-radius:10px; padding:20px 22px;">
                    <p style="margin:0 0 6px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#b91c1c; text-transform:uppercase; letter-spacing:1.5px;">BASVURU REDDEDILDI</p>
                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:17px; font-weight:bold; color:#0f172a; line-height:1.4;">Merhaba ${safeName},</p>
                    <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#475569; line-height:1.7;"><strong>${safeCompany}</strong> adina yaptiginiz kurumsal basvuru incelendi ve maalesef bu asamada onaylanamadi.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${
        safeNote
            ? `
          <tr>
            <td class="section-pad" style="padding:14px 32px 0 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-left:4px solid #b91c1c; border-radius:0 10px 10px 0;">
                <tr>
                  <td bgcolor="#fff1f2" style="background-color:#fff1f2; padding:14px 18px;">
                    <p style="margin:0 0 4px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#9f1239; text-transform:uppercase; letter-spacing:0.5px;">RED GEREKÇESI</p>
                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#1e293b; line-height:1.7;">${safeNote}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
            : ""
    }
          <tr>
            <td class="section-pad" style="padding:14px 32px 0 32px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                <tr>
                  <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:9px; padding:14px 18px;">
                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#334155; line-height:1.7;">Eksik bilgilerinizi tamamlayarak yeniden basvurabilirsiniz. Sorulariniz icin <a href="mailto:info@tedport.com" style="color:#b91c1c;">info@tedport.com</a> adresine yazabilirsiniz.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    return {
        subject: `Kurumsal Başvurunuz Reddedildi | ${companyName} – Tedport`,
        html: emailWrapper(
            "#7f1d1d",
            "linear-gradient(135deg,#7f1d1d 0%,#b91c1c 55%,#ef4444 100%)",
            "#991b1b",
            "BASVURU REDDEDILDI",
            "#fecaca",
            "#fecaca",
            "Kurumsal başvurunuz<br>reddedildi",
            `<strong>${safeCompany}</strong> başvurusu değerlendirme sonuçlandı.`,
            body,
        ),
    };
};

const sendDecisionEmail = async (
    { to, decision, application, actionLink, reviewNote }: {
        to: string;
        decision: "approve" | "reject" | "needs_info";
        application: Record<string, unknown>;
        actionLink?: string;
        reviewNote?: string;
    },
) => {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("CORPORATE_FROM_EMAIL") ||
        Deno.env.get("REMINDER_FROM_EMAIL");

    if (!resendApiKey || !fromEmail) {
        return false;
    }

    const emailPayload = renderReviewEmail({
        application,
        decision,
        actionLink,
        reviewNote,
    });
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject: emailPayload.subject,
            html: emailPayload.html,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return true;
};

const createTemporaryPassword = () => {
    return `Tedport!${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
};

// Enes Doğanay | 6 Nisan 2026: Kurumsal onayda firma kaydi icin stabil ve okunur firmaID uretilir
const slugifyCompanyName = (value: string) => {
    return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
};

const isUuid = (value: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(String(value || "").trim());
};

// Enes Doğanay | 8 Nisan 2026: metadata.requested_firma_id varsa mevcut firmayı kullan
const buildManagedFirmaId = (application: Record<string, unknown>) => {
    // Önce metadata.requested_firma_id kontrol et (kullanıcı mevcut firma seçtiyse)
    const meta = (application.metadata || {}) as Record<string, unknown>;
    const requestedFirmaId = String(meta.requested_firma_id || "").trim();
    if (isUuid(requestedFirmaId)) {
        return requestedFirmaId;
    }

    const existingManagedFirmaId = String(application.managed_firma_id || "")
        .trim();
    if (isUuid(existingManagedFirmaId)) {
        return existingManagedFirmaId;
    }

    return crypto.randomUUID();
};

const buildDefaultProductCatalog = () => [
    {
        ana_kategori: "Tüm Ürünler",
        alt_kategoriler: [
            {
                baslik: "Ürün Listesi",
                urunler: [],
            },
        ],
    },
];

// Enes Doğanay | 8 Nisan 2026: metadata'dan İl/İlçe/telefon doğru şekilde firma kaydına yazılır
const buildManagedFirmaPayload = (
    application: Record<string, unknown>,
    firmaId: string,
) => {
    const meta = (application.metadata || {}) as Record<string, unknown>;
    const companyIl = String(meta.company_il || "").trim();
    const companyIlce = String(meta.company_ilce || "").trim();
    const companyOpenAddress = String(meta.company_open_address || "").trim();
    const companyPhone = String(meta.company_phone || "").trim();
    const addressText = String(application.company_address || "").trim();
    // İl/İlçe formatı: "İstanbul, Bahçelievler"
    const ilIlce = [companyIl, companyIlce].filter(Boolean).join(", ") ||
        addressText || "Belirtilmedi";

    return {
        firmaID: firmaId,
        firma_adi: String(
            application.listed_company_name || application.company_name ||
                "Kurumsal Firma",
        ).trim(),
        web_sitesi: String(application.website_url || "").trim() || null,
        category_name: "Kurumsal Üye",
        description: String(
            application.verification_note ||
                `${
                    String(application.company_name || "Firma")
                } için oluşturulan kurumsal firma profili.`,
        ).trim(),
        firma_turu: "Kurumsal Hesap",
        telefon: companyPhone || String(application.phone || "").trim() || null,
        eposta:
            String(application.corporate_email || "").trim().toLowerCase() ||
            null,
        adres: companyOpenAddress || addressText || null,
        latitude: null,
        longitude: null,
        ana_sektor:
            String(application.tax_office || application.applicant_title || "")
                .trim() || "Belirtilmedi",
        urun_kategorileri: JSON.stringify(buildDefaultProductCatalog()),
        logo_url: null,
        il_ilce: ilIlce,
        best: false,
    };
};

const ensureManagedFirmaRecord = async (
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    application: Record<string, unknown>,
) => {
    const managedFirmaId = buildManagedFirmaId(application);

    const { data: existingFirm, error: existingFirmError } = await supabaseAdmin
        .from("firmalar")
        .select("firmaID")
        .eq("firmaID", managedFirmaId)
        .maybeSingle();

    if (existingFirmError) {
        throw existingFirmError;
    }

    if (existingFirm?.firmaID) {
        return { firmaId: existingFirm.firmaID, created: false };
    }

    const { data: insertedFirm, error: insertFirmError } = await supabaseAdmin
        .from("firmalar")
        .insert([buildManagedFirmaPayload(application, managedFirmaId)])
        .select("firmaID")
        .single();

    if (insertFirmError || !insertedFirm?.firmaID) {
        throw toError(insertFirmError, "Firma kaydı oluşturulamadı.");
    }

    return { firmaId: insertedFirm.firmaID, created: true };
};

const ensureManagedFirmaLink = async ({
    supabaseAdmin,
    applicationId,
    userId,
    firmaId,
}: {
    supabaseAdmin: ReturnType<typeof createAdminClient>;
    applicationId: number;
    userId: string;
    firmaId: string;
}) => {
    const { error } = await supabaseAdmin
        .from("kurumsal_firma_yoneticileri")
        .upsert([
            {
                user_id: userId,
                firma_id: firmaId,
                application_id: applicationId,
                role: "owner",
            },
        ], { onConflict: "user_id" });

    if (error) {
        throw toError(error, "Firma sahipliği kaydedilemedi.");
    }

    // Enes Doğanay | 8 Nisan 2026: Firma onaylı olarak işaretle
    await supabaseAdmin
        .from("firmalar")
        .update({ onayli_hesap: true })
        .eq("firmaID", firmaId);
};

const findExistingUserByEmail = async (
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    email: string,
) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    let page = 1;

    while (page <= 20) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 200,
        });

        if (error) {
            throw error;
        }

        const users = data?.users || [];
        const matchedUser = users.find((user) =>
            String(user.email || "").trim().toLowerCase() === normalizedEmail
        );
        if (matchedUser) {
            return matchedUser;
        }

        if (users.length < 200) {
            break;
        }

        page += 1;
    }

    return null;
};

const getAuthenticatedAdmin = async (
    authorizationHeader: string | null,
    supabaseAdmin: ReturnType<typeof createAdminClient>,
) => {
    if (!authorizationHeader) {
        return { error: "Unauthorized", status: 401 as const };
    }

    const accessToken = authorizationHeader.replace("Bearer ", "");
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data.user) {
        return { error: "Unauthorized", status: 401 as const };
    }

    const { data: adminRow, error: adminError } = await supabaseAdmin
        .from("admin_epostalari")
        .select("email")
        .eq("email", (data.user.email || "").trim().toLowerCase())
        .maybeSingle();

    if (adminError || !adminRow) {
        return { error: "Forbidden", status: 403 as const };
    }

    return { user: data.user };
};

const upsertCorporateProfile = async (
    supabaseAdmin: ReturnType<typeof createAdminClient>,
    userId: string,
    application: Record<string, unknown>,
) => {
    const { error } = await supabaseAdmin
        .from("profiles")
        .upsert([
            {
                id: userId,
                first_name: application.applicant_first_name,
                last_name: application.applicant_last_name,
                company_name: application.company_name,
                phone: application.phone,
                email: application.corporate_email,
            },
        ], { onConflict: "id" });

    if (error) {
        throw error;
    }
};

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const supabaseAdmin = createAdminClient();
    const authorizationHeader = request.headers.get("Authorization");
    const payload = await request.json() as
        | CorporateSubmitPayload
        | CorporateReviewPayload
        | CorporateListPayload;

    if (payload.action === "list") {
        const adminResult = await getAuthenticatedAdmin(
            authorizationHeader,
            supabaseAdmin,
        );
        if ("error" in adminResult) {
            return jsonResponse(
                { error: adminResult.error },
                adminResult.status,
            );
        }

        const { data, error } = await supabaseAdmin
            .from("kurumsal_basvurular")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200);

        if (error) {
            return jsonResponse({ error: error.message }, 500);
        }

        return jsonResponse({ applications: data || [] });
    }

    if (payload.action === "review") {
        const adminResult = await getAuthenticatedAdmin(
            authorizationHeader,
            supabaseAdmin,
        );
        if ("error" in adminResult) {
            return jsonResponse(
                { error: adminResult.error },
                adminResult.status,
            );
        }

        if (!["approve", "reject", "needs_info"].includes(payload.decision)) {
            return jsonResponse({ error: "Geçersiz karar tipi." }, 400);
        }

        const { data: application, error: applicationError } =
            await supabaseAdmin
                .from("kurumsal_basvurular")
                .select("*")
                .eq("id", payload.applicationId)
                .single();

        if (applicationError || !application) {
            return jsonResponse({ error: "Başvuru bulunamadı." }, 404);
        }

        const now = new Date().toISOString();
        const reviewNote = String(payload.reviewNote || "").trim();
        let approvedUserId = application.approved_user_id || null;
        let managedFirmaId =
            String(application.managed_firma_id || "").trim() || null;
        let actionLink = "";
        let createdUserIdForRollback: string | null = null;
        let createdManagedFirmaIdForRollback: string | null = null;
        let activationPending = false;

        if (payload.decision === "approve") {
            const resendApiKey = Deno.env.get("RESEND_API_KEY");
            const fromEmail = Deno.env.get("CORPORATE_FROM_EMAIL") ||
                Deno.env.get("REMINDER_FROM_EMAIL");
            const appBaseUrl = Deno.env.get("APP_BASE_URL");

            if (!resendApiKey || !fromEmail || !appBaseUrl) {
                activationPending = true;
            } else {
                const temporaryPassword = createTemporaryPassword();
                const existingUser = await findExistingUserByEmail(
                    supabaseAdmin,
                    String(application.corporate_email || ""),
                );

                if (existingUser) {
                    const {
                        data: updatedExistingUser,
                        error: updateExistingUserError,
                    } = await supabaseAdmin.auth.admin.updateUserById(
                        existingUser.id,
                        {
                            email_confirm: true,
                            user_metadata: {
                                ...(existingUser.user_metadata || {}),
                                account_type: "corporate",
                                company_name: application.company_name,
                            },
                        },
                    );

                    if (updateExistingUserError || !updatedExistingUser.user) {
                        return jsonResponse({
                            error: updateExistingUserError?.message ||
                                "Mevcut kullanıcı kurumsal hesaba dönüştürülemedi.",
                        }, 400);
                    }

                    approvedUserId = updatedExistingUser.user.id;
                } else {
                    const { data: createdUserResult, error: createUserError } =
                        await supabaseAdmin.auth.admin.createUser({
                            email: String(application.corporate_email || ""),
                            password: temporaryPassword,
                            email_confirm: true,
                            user_metadata: {
                                account_type: "corporate",
                                company_name: application.company_name,
                            },
                        });

                    if (createUserError || !createdUserResult.user) {
                        return jsonResponse({
                            error: createUserError?.message ||
                                "Kurumsal kullanıcı oluşturulamadı.",
                        }, 400);
                    }

                    approvedUserId = createdUserResult.user.id;
                    createdUserIdForRollback = createdUserResult.user.id;
                }

                try {
                    await upsertCorporateProfile(
                        supabaseAdmin,
                        approvedUserId,
                        application as Record<string, unknown>,
                    );
                } catch (error) {
                    if (createdUserIdForRollback) {
                        await supabaseAdmin.auth.admin.deleteUser(
                            createdUserIdForRollback,
                        );
                    }
                    return jsonResponse({
                        error: toError(error, "Profil oluşturulamadı.").message,
                    }, 500);
                }

                try {
                    const managedFirmaResult = await ensureManagedFirmaRecord(
                        supabaseAdmin,
                        application as Record<string, unknown>,
                    );
                    managedFirmaId = managedFirmaResult.firmaId;
                    createdManagedFirmaIdForRollback =
                        managedFirmaResult.created
                            ? managedFirmaResult.firmaId
                            : null;

                    await ensureManagedFirmaLink({
                        supabaseAdmin,
                        applicationId: Number(application.id),
                        userId: approvedUserId,
                        firmaId: managedFirmaId,
                    });
                } catch (error) {
                    if (createdManagedFirmaIdForRollback) {
                        await supabaseAdmin.from("firmalar").delete().eq(
                            "firmaID",
                            createdManagedFirmaIdForRollback,
                        );
                    }
                    if (createdUserIdForRollback) {
                        await supabaseAdmin.auth.admin.deleteUser(
                            createdUserIdForRollback,
                        );
                    }
                    return jsonResponse({
                        error: toError(error, "Firma kaydı oluşturulamadı.")
                            .message,
                    }, 500);
                }

                const { data: generatedLinkData, error: generatedLinkError } =
                    await supabaseAdmin.auth.admin.generateLink({
                        type: "recovery",
                        email: String(application.corporate_email || ""),
                        options: {
                            redirectTo: `${appBaseUrl}/reset-password`,
                        },
                    });

                if (generatedLinkError) {
                    await supabaseAdmin.from("kurumsal_firma_yoneticileri")
                        .delete().eq("user_id", approvedUserId);
                    if (createdManagedFirmaIdForRollback) {
                        await supabaseAdmin.from("firmalar").delete().eq(
                            "firmaID",
                            createdManagedFirmaIdForRollback,
                        );
                    }
                    if (createdUserIdForRollback) {
                        await supabaseAdmin.auth.admin.deleteUser(
                            createdUserIdForRollback,
                        );
                    }
                    return jsonResponse({
                        error: generatedLinkError.message ||
                            "Şifre belirleme bağlantısı üretilemedi.",
                    }, 500);
                }

                actionLink = generatedLinkData?.properties?.action_link ||
                    generatedLinkData?.action_link || "";
                if (!actionLink) {
                    await supabaseAdmin.from("kurumsal_firma_yoneticileri")
                        .delete().eq("user_id", approvedUserId);
                    if (createdManagedFirmaIdForRollback) {
                        await supabaseAdmin.from("firmalar").delete().eq(
                            "firmaID",
                            createdManagedFirmaIdForRollback,
                        );
                    }
                    if (createdUserIdForRollback) {
                        await supabaseAdmin.auth.admin.deleteUser(
                            createdUserIdForRollback,
                        );
                    }
                    return jsonResponse({
                        error: "Şifre belirleme bağlantısı üretilemedi.",
                    }, 500);
                }

                try {
                    await sendDecisionEmail({
                        to: String(application.corporate_email || ""),
                        decision: payload.decision,
                        application: application as Record<string, unknown>,
                        actionLink,
                        reviewNote,
                    });
                } catch (error) {
                    await supabaseAdmin.from("kurumsal_firma_yoneticileri")
                        .delete().eq("user_id", approvedUserId);
                    if (createdManagedFirmaIdForRollback) {
                        await supabaseAdmin.from("firmalar").delete().eq(
                            "firmaID",
                            createdManagedFirmaIdForRollback,
                        );
                    }
                    if (createdUserIdForRollback) {
                        await supabaseAdmin.auth.admin.deleteUser(
                            createdUserIdForRollback,
                        );
                    }
                    return jsonResponse({
                        error: toError(error, "Karar e-postası gönderilemedi.")
                            .message,
                    }, 500);
                }
            }
        } else {
            try {
                await sendDecisionEmail({
                    to: String(application.corporate_email || ""),
                    decision: payload.decision,
                    application: application as Record<string, unknown>,
                    reviewNote,
                });
            } catch (error) {
                return jsonResponse({
                    error: toError(error, "Karar e-postası gönderilemedi.")
                        .message,
                }, 500);
            }
        }

        const nextStatus = payload.decision === "approve"
            ? "approved"
            : payload.decision === "needs_info"
            ? "needs_info"
            : "rejected";
        const metadata = {
            ...(application.metadata || {}),
            activation_pending: activationPending,
            activation_completed: Boolean(approvedUserId),
            activation_link_generated: Boolean(actionLink),
        };

        const { data: updatedApplication, error: updateError } =
            await supabaseAdmin
                .from("kurumsal_basvurular")
                .update({
                    status: nextStatus,
                    review_note: reviewNote || null,
                    reviewed_by_email: adminResult.user.email,
                    reviewed_at: now,
                    approved_user_id: approvedUserId,
                    managed_firma_id: managedFirmaId,
                    approved_at: payload.decision === "approve" ? now : null,
                    rejected_at: payload.decision === "reject" ? now : null,
                    metadata,
                    updated_at: now,
                })
                .eq("id", application.id)
                .select("*")
                .single();

        if (updateError) {
            return jsonResponse({ error: updateError.message }, 500);
        }

        return jsonResponse({ application: updatedApplication });
    }

    const submitPayload = payload as CorporateSubmitPayload;
    const validationError = validateCorporateSubmission(submitPayload);
    if (validationError) {
        return jsonResponse({ error: validationError }, 400);
    }

    const corporateEmail = String(submitPayload.corporateEmail || "").trim()
        .toLowerCase();

    // Enes Doğanay | 7 Nisan 2026: Kurumsal basvuruda auth.users tablosunda mevcut kullanici kontrolu
    const existingAuthUser = await findExistingUserByEmail(
        supabaseAdmin,
        corporateEmail,
    );
    if (existingAuthUser) {
        return jsonResponse({
            error: "Bu e-posta adresi zaten kullanılmaktadır.",
        }, 409);
    }

    const { data: existingPendingApplication, error: existingPendingError } =
        await supabaseAdmin
            .from("kurumsal_basvurular")
            .select("id")
            .eq("status", "pending")
            .eq("corporate_email", corporateEmail)
            .maybeSingle();

    if (existingPendingError) {
        return jsonResponse({ error: existingPendingError.message }, 500);
    }

    if (existingPendingApplication) {
        return jsonResponse({
            error:
                "Bu e-posta adresi için zaten bekleyen bir kurumsal başvuru var.",
        }, 409);
    }

    const { data: createdApplication, error: insertError } = await supabaseAdmin
        .from("kurumsal_basvurular")
        .insert([{
            applicant_first_name: String(submitPayload.applicantFirstName || "")
                .trim(),
            applicant_last_name: String(submitPayload.applicantLastName || "")
                .trim(),
            applicant_title:
                String(submitPayload.applicantTitle || "").trim() || null,
            company_name: String(submitPayload.companyName || "").trim(),
            listed_company_name:
                String(submitPayload.listedCompanyName || "").trim() || null,
            website_url: normalizeWebsiteUrl(submitPayload.websiteUrl),
            corporate_email: corporateEmail,
            phone: String(submitPayload.phone || "").trim(),
            tax_office: String(submitPayload.taxOffice || "").trim() || null,
            tax_number: String(submitPayload.taxNumber || "").trim() || null,
            company_address:
                String(submitPayload.companyAddress || "").trim() || null,
            verification_note:
                String(submitPayload.verificationNote || "").trim() || null,
            metadata: {
                source: "supabase-edge-function",
            },
        }])
        .select("*")
        .single();

    if (insertError) {
        return jsonResponse({ error: insertError.message }, 500);
    }

    return jsonResponse({ application: createdApplication }, 201);
});
