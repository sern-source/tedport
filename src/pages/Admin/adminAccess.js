// Enes Doğanay | 6 Nisan 2026: Admin e-posta listesi frontend tarafinda tek noktadan yorumlanir
// Enes Doğanay | 22 Mayıs 2026: Vite import.meta.env → Next.js process.env.NEXT_PUBLIC_
const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email) => {
    return adminEmails.includes((email || '').trim().toLowerCase());
};

export const hasConfiguredAdminEmails = () => adminEmails.length > 0;
