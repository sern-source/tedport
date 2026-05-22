// Enes Doğanay | 22 Mayıs 2026: Server-side Supabase client — generateMetadata ve Server Components için
// Bu client tarayıcı storage'ı kullanmaz, sadece public veri okuma işlemlerinde kullanılır
// Auth gerektiren işlemler için supabaseClient.js (client-side) kullanılmaya devam eder
import { createClient } from '@supabase/supabase-js';

export function createServerSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
}
