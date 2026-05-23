// Enes Doğanay | 23 Mayıs 2026: Teklif İste — firma + ekibe bildirim maili handler
import { createAdminClient } from "../../_shared/supabaseAdmin.ts";
import { jsonResponse } from "../../_shared/cors.ts";
import { buildQuoteEmailHtml } from "./quoteEmailHtml.ts";
import type { CompanyManagementPayload } from "../types.ts";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

// Enes Doğanay | 23 Mayıs 2026: HTML için XSS-safe string dönüştürücü
const safe = (s: string) =>
    String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

// Enes Doğanay | 23 Mayıs 2026: Alıcı → panel URL haritası oluşturucu
const buildEmailToUrl = async (
    supabaseAdmin: SupabaseAdmin,
    firmaId: string,
    firmaEposta: string,
    teklifIdParam: string,
): Promise<Map<string, string>> => {
    const OWNER_URL =
        `https://tedport.com/firma-profil?tab=teklifler${teklifIdParam}`;
    const TEAM_URL =
        `https://tedport.com/firma-profil?tab=teklifler&from=sirketim${teklifIdParam}`;

    const emailToUrl = new Map<string, string>();
    if (firmaEposta) emailToUrl.set(firmaEposta, OWNER_URL);

    const { data: ekipRows } = await supabaseAdmin
        .from("kurumsal_firma_yoneticileri")
        .select("user_id, role, page_permissions")
        .eq("firma_id", firmaId);

    const authorizedMembers = (ekipRows || [])
        .filter((
            m: {
                role?: string;
                page_permissions?: { teklif_yonetimi?: boolean };
            },
        ) => m.role === "owner" || m.page_permissions?.teklif_yonetimi === true)
        .map((m: { user_id: string; role?: string }) => ({
            userId: m.user_id,
            isOwner: m.role === "owner",
        }));

    for (const { userId, isOwner } of authorizedMembers) {
        try {
            const { data: authUser } = await supabaseAdmin.auth.admin
                .getUserById(userId);
            const email = (authUser?.user?.email || "").trim().toLowerCase();
            if (email) {
                const url = isOwner ? OWNER_URL : TEAM_URL;
                if (!emailToUrl.has(email) || isOwner) {
                    emailToUrl.set(email, url);
                }
            }
        } catch (_e) {
            // Kullanıcı bulunamadıysa atla — mail gönderilemez
        }
    }

    return emailToUrl;
};

// Enes Doğanay | 23 Mayıs 2026: Teklif talebi mail handler — firma kayıtlı mail + teklif_yonetimi ekibine gönderir
export const handleSendQuoteRequestEmail = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
    payload: Extract<
        CompanyManagementPayload,
        { action: "send_quote_request_email" }
    >,
) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authErr } = await supabaseAdmin.auth
        .getUser(token);
    if (authErr || !authData.user) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const firmaId = String(payload.firma_id || "").trim();
    if (!firmaId) return jsonResponse({ error: "firma_id zorunludur." }, 400);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL");
    if (!resendApiKey || !fromEmail) return jsonResponse({ success: true });

    const { data: firma } = await supabaseAdmin
        .from("firmalar")
        .select("firma_adi, eposta")
        .eq("firmaID", firmaId)
        .maybeSingle();
    const firmaAdi = String(firma?.firma_adi || "Firma").trim();
    const firmaEposta = String(firma?.eposta || "").trim().toLowerCase();

    const teklifIdParam = payload.teklif_id
        ? `&teklif_id=${payload.teklif_id}`
        : "";
    const emailToUrl = await buildEmailToUrl(
        supabaseAdmin,
        firmaId,
        firmaEposta,
        teklifIdParam,
    );
    if (emailToUrl.size === 0) return jsonResponse({ success: true });

    const safeRequester = safe(payload.requester_name);
    const safeKonu = safe(payload.konu);
    const safeMesaj = safe(payload.mesaj);
    const safeFirmaAdi = safe(firmaAdi);
    const subject = `${safeRequester} teklif talebinde bulundu — Tedport`;

    for (const [email, panelUrl] of emailToUrl) {
        const html = buildQuoteEmailHtml({
            safeRequester,
            safeKonu,
            safeMesaj,
            safeFirmaAdi,
            panelUrl,
        });
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
            console.error("Teklif talebi maili gönderilemedi:", email, body);
        }
    }

    return jsonResponse({ success: true });
};
