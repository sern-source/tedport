import { createClient } from 'jsr:@supabase/supabase-js@2';

// Enes Doğanay | 6 Nisan 2026: Edge Function'larda service role kullanan yonetici istemci merkezi hale getirildi
export const createAdminClient = () => createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);

export const createAnonClient = (authorizationHeader?: string | null) => createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
        global: {
            headers: authorizationHeader
                ? { Authorization: authorizationHeader }
                : {}
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);
