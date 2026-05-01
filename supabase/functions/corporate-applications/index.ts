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

    if (decision === "approve") {
        return {
            subject: `Tedport Kurumsal Başvurunuz Onaylandı | ${companyName}`,
            html: `
        <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #0f172a;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="padding: 22px 24px; background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: #fff;">
              <h1 style="margin: 0; font-size: 24px;">Kurumsal Başvurunuz Onaylandı</h1>
              <p style="margin: 8px 0 0; opacity: 0.9;">${companyName} için Tedport kurumsal hesabınız hazırlandı.</p>
            </div>
            <div style="padding: 24px;">
              <p style="margin: 0 0 16px; line-height: 1.7;">Merhaba ${
                applicantName || "Tedport kullanıcısı"
            }, başvurunuz incelendi ve onaylandı. Bu e-posta adresi için kurumsal hesabınız oluşturuldu.</p>
              <p style="margin: 0 0 20px; line-height: 1.7; color: #475569;">Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyin. Şifrenizi oluşturduktan sonra bu e-posta adresiyle kurumsal giriş yapabilirsiniz.</p>
              <a href="${
                actionLink || "#"
            }" style="display: inline-block; padding: 14px 18px; border-radius: 999px; background: #1d4ed8; color: #fff; text-decoration: none; font-weight: 700;">Şifremi Belirle</a>
              ${
                reviewNote
                    ? `<p style="margin: 20px 0 0; line-height: 1.7; color: #475569;"><strong>Not:</strong> ${reviewNote}</p>`
                    : ""
            }
            </div>
          </div>
        </div>
      `,
        };
    }

    if (decision === "needs_info") {
        return {
            subject:
                `Başvurunuz İçin Ek Bilgi Gerekli | ${companyName} – Tedport`,
            html: `
        <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #0f172a;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden;">
            <div style="padding: 22px 24px; background: linear-gradient(135deg, #92400e 0%, #d97706 100%); color: #fff;">
              <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Başvurunuz İçin Ek Bilgi Gerekli</h1>
              <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">${companyName}</p>
            </div>
            <div style="padding: 28px 24px;">
              <p style="margin: 0 0 20px; line-height: 1.7; color: #334155;">
                Merhaba <strong>${
                applicantName || "Tedport kullanıcısı"
            }</strong>,<br>
                ${companyName} adına yaptığınız kurumsal başvuru incelenmiş olup değerlendirmeyi tamamlayabilmemiz için sizden ek bilgi almamız gerekmektedir.
              </p>
              ${
                reviewNote
                    ? `
              <div style="background: #fffbeb; border-left: 4px solid #d97706; border-radius: 0 10px 10px 0; padding: 16px 18px; margin: 0 0 20px;">
                <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #92400e;">Talep Edilen Bilgi / Belge</p>
                <p style="margin: 0; line-height: 1.7; color: #1e293b; font-size: 15px;">${reviewNote}</p>
              </div>`
                    : `
              <div style="background: #fffbeb; border-left: 4px solid #d97706; border-radius: 0 10px 10px 0; padding: 16px 18px; margin: 0 0 20px;">
                <p style="margin: 0; line-height: 1.7; color: #1e293b;">Lütfen bize yanıt vererek gerekli detayları paylaşın.</p>
              </div>`
            }
              <p style="margin: 0; line-height: 1.7; color: #64748b; font-size: 13px;">
                Bu e-postaya doğrudan yanıt vererek veya <a href="mailto:info@tedport.com" style="color: #d97706;">info@tedport.com</a> adresine yazarak bilgilerinizi iletebilirsiniz.
              </p>
            </div>
            <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              Tedport Teknoloji A.Ş. | <a href="https://tedport.com" style="color: #94a3b8;">tedport.com</a>
            </div>
          </div>
        </div>
      `,
        };
    }

    return {
        subject: `Kurumsal Başvurunuz Reddedildi | ${companyName} – Tedport`,
        html: `
      <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #0f172a;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden;">
          <div style="padding: 22px 24px; background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%); color: #fff;">
            <div style="font-size: 28px; margin-bottom: 8px;">❌</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Kurumsal Başvurunuz Reddedildi</h1>
            <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">${companyName}</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="margin: 0 0 20px; line-height: 1.7; color: #334155;">
              Merhaba <strong>${
            applicantName || "Tedport kullanıcısı"
        }</strong>,<br>
              ${companyName} adına yaptığınız kurumsal başvuru incelendi ve maalesef bu aşamada onaylanamadı.
            </p>
            ${
            reviewNote
                ? `
            <div style="background: #fff1f2; border-left: 4px solid #b91c1c; border-radius: 0 10px 10px 0; padding: 16px 18px; margin: 0 0 20px;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9f1239;">Red Gerekçesi</p>
              <p style="margin: 0; line-height: 1.7; color: #1e293b; font-size: 15px;">${reviewNote}</p>
            </div>`
                : ""
        }
            <p style="margin: 0; line-height: 1.7; color: #64748b; font-size: 13px;">
              Eksik bilgilerinizi tamamlayarak yeniden başvurabilirsiniz. Sorularınız için <a href="mailto:info@tedport.com" style="color: #b91c1c;">info@tedport.com</a> adresine yazabilirsiniz.
            </p>
          </div>
          <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            Tedport Teknoloji A.Ş. | <a href="https://tedport.com" style="color: #94a3b8;">tedport.com</a>
          </div>
        </div>
      </div>
    `,
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
