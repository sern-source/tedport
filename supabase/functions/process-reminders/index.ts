import { createAdminClient } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const isAuthorizedRequest = (request: Request) => {
    const requestSecret = request.headers.get('X-Edge-Function-Secret');
    const expectedSecret = Deno.env.get('EDGE_FUNCTION_SECRET');

    if (!expectedSecret) {
        return true;
    }

    return requestSecret === expectedSecret;
};

const sendReminderEmail = async ({ to, subject, html }: { to: string; subject: string; html: string; }) => {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('REMINDER_FROM_EMAIL');

    if (!resendApiKey || !fromEmail) {
        throw new Error('RESEND_API_KEY veya REMINDER_FROM_EMAIL eksik.');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html
        })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

const renderReminderEmail = ({ reminder, detailUrl }: { reminder: Record<string, unknown>; detailUrl: string; }) => {
    const reminderDate = new Date(String(reminder.reminder_at || ''));
    const formattedDate = `${reminderDate.toLocaleDateString('tr-TR')} ${reminderDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    const safeTitle = String(reminder.note_title || 'Hatırlatma Notu');
    const safeBody = String(reminder.note_body || 'Hatırlatma içeriği bulunmuyor.');

    return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px; color: #0f172a;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="padding: 20px 24px; background: linear-gradient(135deg, #d29a42 0%, #be7c20 100%); color: #fff;">
          <h1 style="margin: 0; font-size: 22px;">Tedport Hatırlatma</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Planladığınız not hatırlatıcısı zamanı geldi.</p>
        </div>
        <div style="padding: 24px;">
          <div style="display: inline-block; padding: 8px 12px; border-radius: 999px; background: #fff4db; color: #8a5d16; font-weight: 700; font-size: 12px; margin-bottom: 16px;">${formattedDate}</div>
          <h2 style="margin: 0 0 10px; font-size: 20px;">${safeTitle}</h2>
          <p style="margin: 0 0 20px; color: #475569; line-height: 1.7; white-space: pre-wrap;">${safeBody}</p>
          <a href="${detailUrl}" style="display: inline-block; padding: 12px 18px; border-radius: 999px; background: #1d4ed8; color: #fff; text-decoration: none; font-weight: 700;">Firma Detayını Aç</a>
        </div>
      </div>
    </div>
  `;
};

Deno.serve(async (request) => {
    if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    if (!isAuthorizedRequest(request)) {
        return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseAdmin = createAdminClient();
    const now = new Date().toISOString();
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:5173';

    const { data: dueReminders, error: remindersError } = await supabaseAdmin
        .from('kullanici_hatirlaticilari')
        .select('*')
        .eq('status', 'pending')
        .lte('reminder_at', now)
        .order('reminder_at', { ascending: true })
        .limit(50);

    if (remindersError) {
        return jsonResponse({ error: remindersError.message }, 500);
    }

    const results: Array<Record<string, unknown>> = [];

    for (const reminder of dueReminders || []) {
        try {
            const detailUrl = `${appBaseUrl}/firmadetay/${encodeURIComponent(String(reminder.firma_id || ''))}`;
            await sendReminderEmail({
                to: String(reminder.reminder_email || ''),
                subject: `Tedport Hatırlatma: ${String(reminder.note_title || 'Notunuz')}`,
                html: renderReminderEmail({ reminder, detailUrl })
            });

            await supabaseAdmin.from('bildirimler').insert([{
                user_id: reminder.user_id,
                type: 'reminder',
                title: reminder.note_title || 'Hatırlatma Maili Gönderildi',
                message: `Planlanan hatırlatma mailiniz ${new Date(String(reminder.reminder_at || '')).toLocaleString('tr-TR')} tarihinde gönderildi.`,
                firma_id: reminder.firma_id,
                note_id: reminder.note_id,
                reminder_id: reminder.id,
                is_read: false,
                metadata: {
                    reminder_at: reminder.reminder_at,
                    reminder_email: reminder.reminder_email
                }
            }]);

            await supabaseAdmin
                .from('kullanici_hatirlaticilari')
                .update({ status: 'sent', sent_at: now, email_error: null, updated_at: now })
                .eq('id', reminder.id);

            results.push({ id: reminder.id, status: 'sent' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
            await supabaseAdmin
                .from('kullanici_hatirlaticilari')
                .update({ status: 'failed', failed_at: now, email_error: errorMessage, updated_at: now })
                .eq('id', reminder.id);

            results.push({ id: reminder.id, status: 'failed', error: errorMessage });
        }
    }

    return jsonResponse({ processed: results.length, results });
});
