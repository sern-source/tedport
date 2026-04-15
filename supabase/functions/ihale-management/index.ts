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
            return jsonResponse({ tender: updated[0] });
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
