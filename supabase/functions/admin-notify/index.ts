// Enes Doğanay | 12 Haziran 2026: Admin bildirim Edge Function — iletişim, kurumsal başvuru, mesaj şikayeti

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-edge-function-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

// Enes Doğanay | 12 Haziran 2026: process-reminders ile aynı güvenlik pattern'i
// Not: Bu fonksiyon frontend'den çağrıldığından EDGE_FUNCTION_SECRET kontrolü yapılmaz

const safe = (s: unknown) =>
    String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const buildHtml = (type: string, data: Record<string, unknown>): string => {
    const rows = (pairs: Array<[string, unknown]>) =>
        pairs
            .map(
                ([label, value]) => `
        <tr>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#64748b;background:#f1f5f9;width:35%;border-bottom:1px solid #e2e8f0;">${
                    safe(label)
                }</td>
          <td style="padding:10px 16px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;">${
                    safe(value) || "—"
                }</td>
        </tr>`,
            )
            .join("");

    const wrap = (
        title: string,
        color: string,
        icon: string,
        tableRows: string,
    ) => `
    <!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#f8fafc;padding:24px;border-radius:12px;">
        <div style="background:${color};padding:20px 24px;border-radius:8px;margin-bottom:20px;">
          <h2 style="margin:0;color:#fff;font-size:20px;">${icon} ${
        safe(title)
    }</h2>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Tedport Admin Bildirimi</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.07);">
          ${tableRows}
        </table>
        <p style="margin-top:16px;font-size:12px;color:#94a3b8;text-align:center;">
          Bu e-posta Tedport yönetim paneli tarafından otomatik gönderilmiştir.
        </p>
      </div>
    </body></html>`;

    if (type === "contact") {
        return wrap(
            "Yeni İletişim Mesajı",
            "#2563eb",
            "✉️",
            rows([
                ["Ad Soyad", data.name],
                ["E-posta", data.email],
                ["Telefon", data.phone],
                ["Şirket", data.company],
                ["Konu", data.subject],
                ["Mesaj", data.message],
            ]),
        );
    }

    if (type === "corporate") {
        return wrap(
            "Yeni Kurumsal Başvuru",
            "#7c3aed",
            "🏢",
            rows([
                ["Firma Adı", data.companyName],
                ["Yetkili Kişi", data.contactName],
                ["E-posta", data.corporateEmail],
                ["Sektör", data.industry],
                ["Çalışan Sayısı", data.companySize],
                ["Açıklama", data.notes],
            ]),
        );
    }

    if (type === "complaint") {
        return wrap(
            "Yeni Mesaj Şikayeti",
            "#dc2626",
            "🚩",
            rows([
                ["Şikayet Eden (ID)", data.reporterId],
                ["Neden", data.neden],
                ["Kaynak", data.kaynak],
                ["Mesaj İçeriği", data.mesajIcerik],
                ["Açıklama", data.aciklama],
            ]),
        );
    }

    return "<p>Bilinmeyen bildirim tipi.</p>";
};

const SUBJECTS: Record<string, string> = {
    contact: "📬 Yeni İletişim Mesajı — Tedport",
    corporate: "🏢 Yeni Kurumsal Başvuru — Tedport",
    complaint: "🚩 Yeni Mesaj Şikayeti — Tedport",
};

Deno.serve(async (request: Request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
    const adminEmailsRaw = Deno.env.get("ADMIN_NOTIFY_EMAILS") ||
        Deno.env.get("NEXT_PUBLIC_ADMIN_EMAILS") || "";
    const adminEmails = adminEmailsRaw.split(",").map((e: string) => e.trim())
        .filter(Boolean);

    if (!resendApiKey || !fromEmail) {
        return jsonResponse({
            error: "RESEND_API_KEY veya REMINDER_FROM_EMAIL eksik",
        }, 500);
    }
    if (!adminEmails.length) {
        return jsonResponse(
            { error: "Admin e-posta adresi tanımlı değil" },
            500,
        );
    }

    try {
        const { type, data } = await request.json();
        if (!type || !data) {
            return jsonResponse({ error: "type ve data zorunlu" }, 400);
        }

        const html = buildHtml(type, data as Record<string, unknown>);
        const subject = SUBJECTS[type] || "Tedport Admin Bildirimi";

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromEmail,
                to: adminEmails,
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("Resend error:", err);
            return jsonResponse({ error: err }, 500);
        }

        return jsonResponse({ ok: true });
    } catch (err) {
        console.error("admin-notify error:", err);
        return jsonResponse({ error: String(err) }, 500);
    }
});
