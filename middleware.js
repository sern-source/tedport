// Enes Doğanay | 23 Mayıs 2026: Auth middleware — /profile ve /firma-profil için giriş zorunlu
// Auth localStorage'da tutulduğundan middleware doğrudan Supabase session okuyamaz.
// useAuthLoader login'de 'tedport-session' cookie set eder, bu middleware bunu kontrol eder.
// Güvenlik RLS + component katmanında; bu sadece UX redirect mekanizması.
import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/profile', '/firma-profil'];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
    if (!isProtected) return NextResponse.next();

    const sessionCookie = request.cookies.get('tedport-session');
    if (sessionCookie?.value === '1') return NextResponse.next();

    // Enes Doğanay | 23 Mayıs 2026: Giriş yapılmamış — login'e yönlendir, tam URL (path + query) redirect param'a aktar
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: ['/profile/:path*', '/firma-profil/:path*'],
};
