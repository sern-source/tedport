// Enes Doğanay | 6 Nisan 2026: Admin e-posta listesi frontend tarafinda tek noktadan yorumlanir
const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email) => {
    return adminEmails.includes((email || '').trim().toLowerCase());
};

export const hasConfiguredAdminEmails = () => adminEmails.length > 0;
