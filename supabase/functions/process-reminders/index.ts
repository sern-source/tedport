import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const isAuthorizedRequest = (request: Request) => {
    const requestSecret = request.headers.get("X-Edge-Function-Secret");
    const expectedSecret = Deno.env.get("EDGE_FUNCTION_SECRET");

    if (!expectedSecret) {
        return true;
    }

    return requestSecret === expectedSecret;
};

const sendReminderEmail = async (
    { to, subject, html }: { to: string; subject: string; html: string },
) => {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");

    if (!resendApiKey || !fromEmail) {
        throw new Error("RESEND_API_KEY veya REMINDER_FROM_EMAIL eksik.");
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

const renderReminderEmail = (
    { reminder, detailUrl }: {
        reminder: Record<string, unknown>;
        detailUrl: string;
    },
) => {
    const reminderDate = new Date(String(reminder.reminder_at || ""));
    const formattedDate = `${reminderDate.toLocaleDateString("tr-TR")} ${
        reminderDate.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }`;
    const safe = (s: unknown) =>
        String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(
            />/g,
            "&gt;",
        ).replace(/"/g, "&quot;");
    const safeTitle = safe(reminder.note_title || "Hatırlatma Notu");
    const safeBody = safe(
        reminder.note_body || "Hatırlatma içeriği bulunmuyor.",
    );
    const safeUrl = detailUrl;

    return `<!DOCTYPE html>
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
<body style="margin:0; padding:0; background-color:#fdf6ec;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fdf6ec">
  <tr>
    <td class="email-wrap" align="center" style="padding:40px 16px;">

      <!-- CONTAINER -->
      <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">

        <!-- HEADER -->
        <tr>
          <td bgcolor="#92400e" style="background-color:#92400e; background-image:linear-gradient(135deg,#78350f 0%,#b45309 55%,#d97706 100%); border-radius:16px 16px 0 0; padding:30px 40px 26px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="middle">
                  <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:20px; font-weight:bold; color:#ffffff;">Tedport</p>
                  <p style="margin:3px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#fde68a; text-transform:uppercase; letter-spacing:1px;">Tedarik Portali</p>
                </td>
                <td align="right" valign="middle">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td bgcolor="#a16207" style="background-color:#a16207; border-radius:20px; padding:5px 14px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#fef3c7;">HATIRLATMA</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:22px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:25px; font-weight:bold; color:#ffffff; line-height:1.3;">Not hatirlatmaniz<br>zamanı geldi!</p>
            <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#fde68a; line-height:1.6;">Planladığınız hatırlatıcı için belirlediğiniz zaman geldi.</p>
          </td>
        </tr>

        <!-- WHITE BODY -->
        <tr>
          <td bgcolor="#ffffff" style="background-color:#ffffff; border-radius:0 0 16px 16px; padding:0 0 32px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">

              <!-- Date badge -->
              <tr>
                <td class="section-pad" style="padding:28px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td bgcolor="#fff7ed" style="background-color:#fff7ed; border:1px solid #fed7aa; border-radius:20px; padding:6px 14px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; font-weight:bold; color:#c2410c;">${formattedDate}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Note card -->
              <tr>
                <td class="section-pad" style="padding:16px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #fed7aa; border-radius:12px;">
                    <tr>
                      <td bgcolor="#fffbf5" style="background-color:#fffbf5; border-radius:10px; padding:20px 22px;">
                        <p style="margin:0 0 6px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#b45309; text-transform:uppercase; letter-spacing:1.5px;">NOT BASLIGINIZ</p>
                        <p style="margin:0 0 14px 0; font-family:Arial,Helvetica,sans-serif; font-size:18px; font-weight:bold; color:#0f172a; line-height:1.35;">${safeTitle}</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#475569; line-height:1.7;">${safeBody}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Info row -->
              <tr>
                <td class="section-pad" style="padding:16px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:9px; padding:14px 18px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#64748b; line-height:1.6;">Bu hatırlatıcıyı siz planladınız. Firma detayı sayfasından ilgili notu görüntüleyebilir veya hatırlatıcıyı yönetebilirsiniz.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td class="section-pad btn-td" style="padding:28px 32px 0 32px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="50%" stroke="f" fillcolor="#d97706">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">Firma Detayini Ac</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${safeUrl}" style="background-color:#d97706; border-radius:999px; color:#ffffff; display:inline-block; font-family:Arial,Helvetica,sans-serif; font-size:14px; font-weight:bold; line-height:46px; text-align:center; text-decoration:none; width:220px; -webkit-text-size-adjust:none;">Firma Detayini Ac</a>
                  <!--<![endif]-->
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding:20px 0 0 0;">
            <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#94a3b8;">Tedport Teknoloji A.S. &nbsp;|&nbsp; <a href="https://tedport.com" style="color:#94a3b8; text-decoration:none;">tedport.com</a></p>
            <p style="margin:6px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#cbd5e1;">Bu mail hesabinizda kayıtlı olan hatırlatıcı nedeniyle gönderilmiştir.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
};

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (!isAuthorizedRequest(request)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseAdmin = createAdminClient();
    const now = new Date().toISOString();
    const appBaseUrl = Deno.env.get("APP_BASE_URL") || "http://localhost:5173";

    const { data: dueReminders, error: remindersError } = await supabaseAdmin
        .from("kullanici_hatirlaticilari")
        .select("*")
        .eq("status", "pending")
        .lte("reminder_at", now)
        .order("reminder_at", { ascending: true })
        .limit(50);

    if (remindersError) {
        return jsonResponse({ error: remindersError.message }, 500);
    }

    const results: Array<Record<string, unknown>> = [];

    for (const reminder of dueReminders || []) {
        try {
            const detailUrl = `${appBaseUrl}/firmadetay/${
                encodeURIComponent(String(reminder.firma_id || ""))
            }`;
            await sendReminderEmail({
                to: String(reminder.reminder_email || ""),
                subject: `Tedport Hatırlatma: ${
                    String(reminder.note_title || "Notunuz")
                }`,
                html: renderReminderEmail({ reminder, detailUrl }),
            });

            await supabaseAdmin.from("bildirimler").insert([{
                user_id: reminder.user_id,
                type: "reminder",
                // Enes Doğanay | 8 Nisan 2026: Site bildirimi not içeriğine odaklı olarak güncellendi
                title: `Not Hatırlatması: ${
                    String(reminder.note_title || "İsimsiz Not")
                }`,
                message: String(reminder.note_body || "").slice(0, 200) ||
                    "Hatırlatma zamanı geldi.",
                firma_id: reminder.firma_id,
                note_id: reminder.note_id,
                reminder_id: reminder.id,
                is_read: false,
                metadata: {
                    reminder_at: reminder.reminder_at,
                    reminder_email: reminder.reminder_email,
                    note_title: reminder.note_title,
                    note_body: String(reminder.note_body || "").slice(0, 300),
                },
            }]);

            await supabaseAdmin
                .from("kullanici_hatirlaticilari")
                .update({
                    status: "sent",
                    sent_at: now,
                    email_error: null,
                    updated_at: now,
                })
                .eq("id", reminder.id);

            results.push({ id: reminder.id, status: "sent" });
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : "Bilinmeyen hata";
            await supabaseAdmin
                .from("kullanici_hatirlaticilari")
                .update({
                    status: "failed",
                    failed_at: now,
                    email_error: errorMessage,
                    updated_at: now,
                })
                .eq("id", reminder.id);

            results.push({
                id: reminder.id,
                status: "failed",
                error: errorMessage,
            });
        }
    }

    return jsonResponse({ processed: results.length, results });
});
