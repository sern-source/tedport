// Enes Doğanay | 23 Mayıs 2026: Şirket yönetim edge function — sadece yönlendirme
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import type { CompanyManagementPayload } from "./types.ts";
import {
    handleAdminCreateCompany,
    handleAdminDeleteCompany,
    handleAdminGetCompany,
    handleAdminUpdateCompany,
    handleAdminUpdateLogo,
} from "./handlers/adminHandlers.ts";
import { handleSendQuoteRequestEmail } from "./handlers/quoteEmailHandler.ts";
import {
    handleGetMyCompany,
    handleUpdateMyCompany,
} from "./handlers/myCompanyHandlers.ts";

// Enes Doğanay | 23 Mayıs 2026: İstek yönlendirici — her action uygun handler'a iletilir
Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const supabaseAdmin = createAdminClient();
    const payload = await request.json() as CompanyManagementPayload;

    if (payload.action === "admin_update_logo") {
        return handleAdminUpdateLogo(request, supabaseAdmin, payload);
    }
    if (payload.action === "admin_get_company") {
        return handleAdminGetCompany(request, supabaseAdmin, payload);
    }
    if (payload.action === "admin_update_company") {
        return handleAdminUpdateCompany(request, supabaseAdmin, payload);
    }
    if (payload.action === "admin_create_company") {
        return handleAdminCreateCompany(request, supabaseAdmin, payload);
    }
    if (payload.action === "admin_delete_company") {
        return handleAdminDeleteCompany(request, supabaseAdmin, payload);
    }
    if (payload.action === "send_quote_request_email") {
        return handleSendQuoteRequestEmail(request, supabaseAdmin, payload);
    }
    if (payload.action === "get_my_company") {
        return handleGetMyCompany(request, supabaseAdmin, payload);
    }
    if (payload.action === "update_my_company") {
        return handleUpdateMyCompany(request, supabaseAdmin, payload);
    }

    return jsonResponse({ error: "Unknown action" }, 400);
});
