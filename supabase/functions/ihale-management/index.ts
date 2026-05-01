// Enes Doganay | 6 Nisan 2026: Ihale yonetim Edge Function
// Enes Doganay | 10 Nisan 2026: Yeni modal alanlari — kdv_durumu, gereksinimler, davet_emailleri, davetli_firmalar, teslim_il/teslim_ilce
// Enes Doganay | 15 Nisan 2026: send_offer_status_email aksiyonu — teklif kabul/red e-postası
// Aksiyonlar: list_my_tenders | create_tender | update_tender | delete_tender | send_offer_status_email
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type IhalePayload =
    | { action: "list_my_tenders" }
    | { action: "create_tender"; tender: TenderInput }
    | { action: "update_tender"; id: string; tender: TenderInput }
    | { action: "delete_tender"; id: string }
    // Enes Doganay | 15 Nisan 2026: Teklif kabul/red e-postası
    | {
        action: "send_offer_status_email";
        to: string;
        status: string;
        ihale_baslik: string;
        gonderen_ad: string;
        red_nedeni?: string | null;
        ihale_id?: string | null;
    };

// Enes Doganay | 10 Nisan 2026: Gereksinim ve davetli firma tipleri
interface GereksinimItem {
    id: number;
    madde: string;
    aciklama?: string;
}

interface DavetliFirma {
    firma_id: string;
    firma_adi: string;
    onayli: boolean;
}

interface TenderInput {
    baslik: string;
    aciklama?: string | null;
    ihale_tipi?: string | null;
    kdv_durumu?: string | null;
    yayin_tarihi?: string | null;
    son_basvuru_tarihi?: string | null;
    durum?: "draft" | "canli" | "kapali";
    referans_no?: string | null;
    il_ilce?: string | null;
    teslim_suresi?: string | null;
    teslim_il?: string | null;
    teslim_ilce?: string | null;
    gereksinimler?: GereksinimItem[] | null;
    davet_emailleri?: string[] | null;
    davetli_firmalar?: DavetliFirma[] | null;
    // Enes Doganay | 10 Nisan 2026: Ek dosya meta bilgileri [{name, path, size, url}]
    ek_dosyalar?:
        | Array<{ name: string; path: string; size: number; url: string }>
        | null;
    // Enes Doganay | 15 Nisan 2026: Kapali ihalenin baskalarına gorunurlugu
    kapali_gorunurluk?: string | null;
}

// Enes Doganay | 6 Nisan 2026: Bos string -> null donusturur
const str = (v?: string | null): string | null => {
    const t = String(v || "").trim();
    return t || null;
};

// Enes Doganay | 6 Nisan 2026: Tarih dogrulama, gecersizse null doner
const safeDate = (v?: string | null): string | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
};

// Enes Doganay | 6 Nisan 2026: Bugunun tarihini YYYY-MM-DD formatinda doner
const today = (): string => new Date().toISOString().split("T")[0];

// Enes Doganay | 1 Mayis 2026: Davet emaillerini gonder — DB sorgusu yok, direkt Resend
const sendInvitationEmails = async (
    emails: string[],
    tenderBaslik: string,
    tenderId: string,
    firmaAdi: string,
): Promise<void> => {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
    if (!resendApiKey || !fromEmail) return;

    const tenderUrl = `https://tedport.com/ihaleler?ihale=${tenderId}`;
    const safe = (s: string) =>
        String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
            />/g,
            "&gt;",
        ).replace(/"/g, "&quot;");
    const safeBaslik = safe(tenderBaslik);
    const safeFirma = safe(firmaAdi);
    const safeUrl = tenderUrl; // URL has no user input, no escaping needed for href

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
<body style="margin:0; padding:0; background-color:#f1f5f9;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f5f9">
  <tr>
    <td class="email-wrap" align="center" style="padding:40px 16px;">

      <!-- ═══ CONTAINER ═══ -->
      <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">

        <!-- ── HEADER ── -->
        <tr>
          <td bgcolor="#1e3a8a" style="background-color:#1e3a8a; background-image:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#3b82f6 100%); border-radius:16px 16px 0 0; padding:32px 40px 28px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="middle">
                  <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:20px; font-weight:bold; color:#ffffff;">Tedport</p>
                  <p style="margin:3px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#93c5fd; text-transform:uppercase; letter-spacing:1px;">Tedarik Portali</p>
                </td>
                <td align="right" valign="middle">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td bgcolor="#2d5be3" style="background-color:#2d5be3; border-radius:20px; padding:5px 14px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#dbeafe;">IHALE DAVETI</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <!-- Heading -->
            <p style="margin:24px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:26px; font-weight:bold; color:#ffffff; line-height:1.25;">Yeni bir ihaleye<br>davet edildiniz!</p>
            <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#93c5fd; line-height:1.6;"><strong style="color:#ffffff;">${safeFirma}</strong> firmasi sizi Tedport uzerindeki bir ihaleye teklif vermeye davet etti.</p>
          </td>
        </tr>

        <!-- ── WHITE BODY ── -->
        <tr>
          <td bgcolor="#ffffff" style="background-color:#ffffff; border-radius:0 0 16px 16px; padding:0 0 32px 0;">

            <!-- Tender card -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td class="section-pad" style="padding:28px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #bfdbfe; border-radius:12px;">
                    <tr>
                      <td bgcolor="#eff6ff" style="background-color:#eff6ff; border-radius:10px; padding:20px 22px;">
                        <p style="margin:0 0 8px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#2563eb; text-transform:uppercase; letter-spacing:1.5px;">IHALE BASLIGI</p>
                        <p style="margin:0 0 14px 0; font-family:Arial,Helvetica,sans-serif; font-size:18px; font-weight:bold; color:#0f172a; line-height:1.35;">${safeBaslik}</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-right:8px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td bgcolor="#dbeafe" style="background-color:#dbeafe; border-radius:20px; padding:4px 12px;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#1d4ed8;">Aktif Ihale</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td bgcolor="#dcfce7" style="background-color:#dcfce7; border-radius:20px; padding:4px 12px;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#15803d;">Teklif Verilebilir</p>
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

              <!-- Firma box -->
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
                                  <td width="40" height="40" bgcolor="#1d4ed8" style="background-color:#1d4ed8; border-radius:8px; text-align:center; vertical-align:middle;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:18px; line-height:40px; text-align:center; color:#ffffff;">&#127970;</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding-left:12px;" valign="middle">
                              <p style="margin:0 0 2px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#94a3b8; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Davet Eden Firma</p>
                              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:bold; color:#0f172a;">${safeFirma}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td class="section-pad btn-td" align="center" style="padding:28px 32px 0 32px; text-align:center;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:52px;v-text-anchor:middle;width:340px;" arcsize="17%" strokecolor="#1d4ed8" fillcolor="#1d4ed8">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">Ihaleyi Goruntule ve Teklif Ver</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${safeUrl}" style="display:inline-block; background-color:#1d4ed8; color:#ffffff; text-decoration:none; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; padding:15px 36px; border-radius:10px; mso-hide:all;">Ihaleyi Goruntule ve Teklif Ver</a>
                  <!--<![endif]-->
                  <p style="margin:12px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#94a3b8; text-align:center; line-height:1.7;">Ya da bu linki tarayiciniza kopyalayin:<br><a href="${safeUrl}" style="color:#2563eb; font-size:11px; word-break:break-all;">${safeUrl}</a></p>
                </td>
              </tr>

              <!-- Steps -->
              <tr>
                <td class="section-pad" style="padding:24px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:10px; padding:18px 20px;">
                        <p style="margin:0 0 12px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#1e40af;">Nasil teklif veririm?</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">1.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Yukaridaki butona tiklayarak ihaleyi goruntuleyin.</p></td>
                          </tr>
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">2.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Hesabiniza giris yapin ya da kayit olun.</p></td>
                          </tr>
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">3.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">&quot;Teklif Ver&quot; butonuna tiklayarak teklifinizi olusturun.</p></td>
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
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#94a3b8; line-height:1.7;">Bu e-posta, <strong style="color:#64748b;">${safeFirma}</strong> firmasinin<br>Tedport uzerinden gonderdigi otomatik bir davet bildirimidir.<br>Sorulariniz icin <a href="mailto:info@tedport.com" style="color:#2563eb; text-decoration:none;">info@tedport.com</a></p>
                      </td>
                      <td align="right" valign="top" style="padding-left:16px; white-space:nowrap;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#1e40af;">Tedport</p>
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
      <!-- ═══ /CONTAINER ═══ -->

    </td>
  </tr>
</table>
</body>
</html>`;

    for (const rawEmail of emails) {
        const email = String(rawEmail || "").trim().toLowerCase();
        if (!email) continue;
        const resp = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: `${safeFirma} sizi ihaleye davet etti — Tedport`,
                html,
            }),
        });
        if (!resp.ok) {
            console.error(
                "Davet maili gonderilemedi:",
                email,
                await resp.text(),
            );
        } else {
            console.log("Davet maili gonderildi:", email);
        }
    }
};

// Enes Doganay | 6 Nisan 2026: Durum degeri DB CHECK constraint ile uyumlu olmali
const VALID_DURUM = ["draft", "canli", "kapali"] as const;
const normalizeDurum = (v: unknown): string => {
    const d = String(v || "").toLowerCase().trim();
    if ((VALID_DURUM as readonly string[]).includes(d)) return d;
    return "canli";
};

// Enes Doganay | 6 Nisan 2026: JWT'den kullanici kimligini ve firma_id bilgisini dogrular
const getAuthenticatedManager = async (
    request: Request,
    supabaseAdmin: ReturnType<typeof createAdminClient>,
) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return { error: "Unauthorized", status: 401 as const };

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
        return { error: "Unauthorized", status: 401 as const };
    }

    const { data: row, error: rowErr } = await supabaseAdmin
        .from("kurumsal_firma_yoneticileri")
        .select("firma_id, role")
        .eq("user_id", data.user.id)
        .maybeSingle();

    if (rowErr || !row?.firma_id) {
        return {
            error: "Bu hesap icin yonetilen firma bulunamadi.",
            status: 403 as const,
        };
    }

    return { user: data.user, firmaId: row.firma_id as string };
};

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseAdmin = createAdminClient();

    try {
        const authResult = await getAuthenticatedManager(
            request,
            supabaseAdmin,
        );
        if ("error" in authResult) {
            return jsonResponse({ error: authResult.error }, authResult.status);
        }

        const { firmaId } = authResult;
        const payload: IhalePayload = await request.json();

        // ── Liste ──────────────────────────────────────────────────────────
        if (payload.action === "list_my_tenders") {
            const { data, error } = await supabaseAdmin
                .from("firma_ihaleleri")
                .select("*")
                .eq("firma_id", firmaId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return jsonResponse({ tenders: data ?? [] });
        }

        // ── Olustur ────────────────────────────────────────────────────────
        // Enes Doganay | 10 Nisan 2026: Yeni alanlar eklendi — kdv, gereksinimler, davet emailleri, davetli firmalar, teslim il/ilce
        if (payload.action === "create_tender") {
            const t = payload.tender;
            if (!t?.baslik?.trim()) {
                return jsonResponse(
                    { error: "Ihale basligi zorunludur." },
                    400,
                );
            }

            const row = {
                firma_id: firmaId,
                baslik: t.baslik.trim(),
                aciklama: str(t.aciklama),
                ihale_tipi: str(t.ihale_tipi),
                kdv_durumu: str(t.kdv_durumu) ?? "haric",
                // Enes Doganay | 6 Nisan 2026: yayin_tarihi NOT NULL — bos ise bugunun tarihini kullan
                yayin_tarihi: safeDate(t.yayin_tarihi) ?? today(),
                son_basvuru_tarihi: safeDate(t.son_basvuru_tarihi),
                durum: normalizeDurum(t.durum),
                referans_no: str(t.referans_no),
                il_ilce: str(t.il_ilce),
                teslim_suresi: str(t.teslim_suresi),
                teslim_il: str(t.teslim_il),
                teslim_ilce: str(t.teslim_ilce),
                gereksinimler: t.gereksinimler ?? null,
                davet_emailleri: t.davet_emailleri ?? null,
                davetli_firmalar: t.davetli_firmalar ?? null,
                ek_dosyalar: t.ek_dosyalar ?? null,
                // Enes Doganay | 15 Nisan 2026: Kapali gorunurluk
                kapali_gorunurluk: str(t.kapali_gorunurluk),
            };

            const { data, error } = await supabaseAdmin
                .from("firma_ihaleleri")
                .insert(row)
                .select()
                .single();

            if (error) throw error;

            // Enes Doganay | 1 Mayis 2026: Taslak degilse davet emaillerini gonder
            const inviteEmails = Array.isArray(t.davet_emailleri)
                ? t.davet_emailleri.filter(Boolean) as string[]
                : [];
            if (data.durum !== "draft" && inviteEmails.length > 0) {
                const { data: firmaRow } = await supabaseAdmin
                    .from("firmalar")
                    .select("firma_adi")
                    .eq("firmaID", firmaId)
                    .maybeSingle();
                const firmaAdi =
                    (firmaRow as { firma_adi?: string } | null)?.firma_adi ??
                        "Bilinmeyen Firma";
                await sendInvitationEmails(
                    inviteEmails,
                    data.baslik,
                    String(data.id),
                    firmaAdi,
                )
                    .catch((err) =>
                        console.error("sendInvitationEmails hata:", err)
                    );
            }

            return jsonResponse({ tender: data }, 201);
        }

        // ── Guncelle ───────────────────────────────────────────────────────
        // Enes Doganay | 10 Nisan 2026: Yeni alanlar eklendi, kategori/butce_notu kaldırıldı
        if (payload.action === "update_tender") {
            if (!payload.id) {
                return jsonResponse({ error: "Ihale ID gerekli." }, 400);
            }

            const t = payload.tender;
            if (!t?.baslik?.trim()) {
                return jsonResponse(
                    { error: "Ihale basligi zorunludur." },
                    400,
                );
            }

            const updateObj: Record<string, unknown> = {
                baslik: t.baslik.trim(),
                aciklama: str(t.aciklama),
                ihale_tipi: str(t.ihale_tipi),
                kdv_durumu: str(t.kdv_durumu) ?? "haric",
                son_basvuru_tarihi: safeDate(t.son_basvuru_tarihi),
                durum: normalizeDurum(t.durum),
                referans_no: str(t.referans_no),
                il_ilce: str(t.il_ilce),
                teslim_suresi: str(t.teslim_suresi),
                teslim_il: str(t.teslim_il),
                teslim_ilce: str(t.teslim_ilce),
                gereksinimler: t.gereksinimler ?? null,
                davet_emailleri: t.davet_emailleri ?? null,
                davetli_firmalar: t.davetli_firmalar ?? null,
                ek_dosyalar: t.ek_dosyalar ?? null,
                // Enes Doganay | 15 Nisan 2026: Kapali gorunurluk
                kapali_gorunurluk: str(t.kapali_gorunurluk),
            };

            console.log(
                "update durum received:",
                JSON.stringify(t.durum),
                "-> normalized:",
                updateObj.durum,
            );

            // yayin_tarihi NOT NULL -> bos gelirse objeye ekleme, DB'deki mevcut deger korunur
            const parsedDate = safeDate(t.yayin_tarihi);
            if (parsedDate) {
                updateObj.yayin_tarihi = parsedDate;
            }

            const { data: updated, error: updErr } = await supabaseAdmin
                .from("firma_ihaleleri")
                .update(updateObj)
                .eq("id", payload.id)
                .eq("firma_id", firmaId)
                .select();

            if (updErr) throw updErr;
            if (!updated || updated.length === 0) {
                return jsonResponse({
                    error: "Ihale bulunamadi veya bu firmaya ait degil.",
                }, 404);
            }

            // Enes Doganay | 1 Mayis 2026: Taslak -> canli gecisinde davet emaillerini gonder
            const updatedTender = updated[0];
            const updInviteEmails = Array.isArray(t.davet_emailleri)
                ? t.davet_emailleri.filter(Boolean) as string[]
                : [];
            if (updatedTender.durum !== "draft" && updInviteEmails.length > 0) {
                const { data: updFirmaRow } = await supabaseAdmin
                    .from("firmalar")
                    .select("firma_adi")
                    .eq("firmaID", firmaId)
                    .maybeSingle();
                const updFirmaAdi =
                    (updFirmaRow as { firma_adi?: string } | null)?.firma_adi ??
                        "Bilinmeyen Firma";
                await sendInvitationEmails(
                    updInviteEmails,
                    updatedTender.baslik,
                    String(updatedTender.id),
                    updFirmaAdi,
                )
                    .catch((err) =>
                        console.error(
                            "sendInvitationEmails (update) hata:",
                            err,
                        )
                    );
            }

            return jsonResponse({ tender: updatedTender });
        }

        // ── Sil ────────────────────────────────────────────────────────────
        if (payload.action === "delete_tender") {
            if (!payload.id) {
                return jsonResponse({ error: "Ihale ID gerekli." }, 400);
            }

            const { error } = await supabaseAdmin
                .from("firma_ihaleleri")
                .delete()
                .eq("id", payload.id)
                .eq("firma_id", firmaId);

            if (error) throw error;
            return jsonResponse({ success: true });
        }

        // ── Teklif Kabul / Red E-postasi ────────────────────────────────
        // Enes Doganay | 15 Nisan 2026: Resend API ile teklif durumu bilgilendirme e-postası
        if (payload.action === "send_offer_status_email") {
            const resendApiKey = Deno.env.get("RESEND_API_KEY");
            const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
            if (!resendApiKey || !fromEmail) {
                return jsonResponse(
                    { error: "E-posta yapilandirmasi eksik." },
                    500,
                );
            }
            if (!payload.to || !payload.status) {
                return jsonResponse({
                    error: "to ve status alanlari zorunludur.",
                }, 400);
            }

            const isAccepted = payload.status === "kabul";
            const isReview = payload.status === "gonderildi";
            const statusLabel = isAccepted
                ? "kabul edildi"
                : isReview
                ? "değerlendirmeye alındı"
                : "reddedildi";
            const statusColor = isAccepted
                ? "#16a34a"
                : isReview
                ? "#2563eb"
                : "#dc2626";
            const statusBg = isAccepted
                ? "#f0fdf4"
                : isReview
                ? "#eff6ff"
                : "#fef2f2";
            const statusIcon = isAccepted ? "✅" : isReview ? "🔄" : "❌";

            const redNedeniBolumu =
                (!isAccepted && !isReview && payload.red_nedeni)
                    ? `<div style="margin: 16px 0; padding: 14px 18px; border-radius: 12px; background: #fffbeb; border-left: 4px solid #f59e0b;">
                     <strong style="color: #92400e; font-size: 13px;">Red Nedeni:</strong>
                     <p style="margin: 8px 0 0; color: #78350f; line-height: 1.6;">${
                        String(payload.red_nedeni).replace(/</g, "&lt;")
                            .replace(
                                />/g,
                                "&gt;",
                            )
                    }</p>
                   </div>`
                    : "";

            const html = `
            <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #0f172a;">
              <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="padding: 20px 24px; background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); color: #fff;">
                  <h1 style="margin: 0; font-size: 22px;">Tedport İhale Bildirimi</h1>
                  <p style="margin: 8px 0 0; opacity: 0.9;">Teklif durumunuz güncellendi.</p>
                </div>
                <div style="padding: 24px;">
                  <p style="margin: 0 0 16px; font-size: 15px; color: #475569;">Sayın <strong>${
                String(payload.gonderen_ad || "Kullanıcı").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
            }</strong>,</p>
                  <div style="display: inline-block; padding: 10px 18px; border-radius: 12px; background: ${statusBg}; color: ${statusColor}; font-weight: 700; font-size: 14px; margin-bottom: 16px;">
                    ${statusIcon} Teklifiniz ${statusLabel}
                  </div>
                  <p style="margin: 0 0 8px; font-size: 14px; color: #475569;">İhale: <strong>${
                String(payload.ihale_baslik || "-").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
            }</strong></p>
                  ${redNedeniBolumu}
                  ${
                payload.ihale_id
                    ? `<div style="text-align: center; margin: 20px 0 8px;">
                    <a href="https://tedport.com/ihaleler?ihale=${
                        String(payload.ihale_id).replace(/</g, "&lt;").replace(
                            />/g,
                            "&gt;",
                        )
                    }" style="display: inline-block; padding: 12px 28px; border-radius: 12px; background: linear-gradient(135deg, #1e40af, #3b82f6); color: #fff; text-decoration: none; font-weight: 700; font-size: 14px;">Teklif Detayına Git</a>
                  </div>`
                    : ""
            }
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="margin: 0; font-size: 13px; color: #94a3b8;">Bu e-posta Tedport ihale sistemi tarafından otomatik olarak gönderilmiştir.</p>
                </div>
              </div>
            </div>`;

            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [payload.to],
                    subject: `Tedport — Teklifiniz ${statusLabel}`,
                    html,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Resend API hatasi:", errText);
                return jsonResponse({ error: "E-posta gonderilemedi." }, 502);
            }

            return jsonResponse({ success: true });
        }

        return jsonResponse({ error: "Gecersiz aksiyon." }, 400);
    } catch (err) {
        // Enes Doganay | 6 Nisan 2026: PostgrestError instanceof Error degil, .message ile yakala
        const message = (err as any)?.message ||
            (typeof err === "string" ? err : "Bilinmeyen sunucu hatasi.");
        console.error("ihale-management error:", message, err);
        return jsonResponse({ error: message }, 500);
    }
});
