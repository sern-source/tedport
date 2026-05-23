// Enes Doğanay | 23 Mayıs 2026: Kimlik doğrulama yardımcıları — yönetici ve admin yetkilendirme
import { createAdminClient } from "../_shared/supabaseAdmin.ts";
import { jsonResponse } from "../_shared/cors.ts";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

// Enes Doğanay | 23 Mayıs 2026: Admin yetkilendirme — admin_epostalari tablosundan kontrol
export const getAuthenticatedAdmin = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
): Promise<{ user: ReturnType<typeof createAdminClient> } | Response> => {
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

    // deno-lint-ignore no-explicit-any
    return { user: authData.user as any };
};

// Enes Doğanay | 23 Mayıs 2026: Firma yöneticisi yetkilendirme — kurumsal_firma_yoneticileri
export const getAuthenticatedManager = async (
    request: Request,
    supabaseAdmin: SupabaseAdmin,
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

    return { user: data.user, managerRow };
};
