// Enes Doğanay | 23 Mayıs 2026: Firma veri normalleştirme yardımcıları

export const normalizeWebsiteUrl = (value?: string | null) => {
    const trimmedValue = String(value || "").trim();
    if (!trimmedValue) return null;
    return /^https?:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`;
};

export const normalizeOptionalString = (value?: string | null) => {
    const trimmedValue = String(value || "").trim();
    return trimmedValue || null;
};

export const normalizeCoordinate = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") return null;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
};

// Enes Doğanay | 23 Mayıs 2026: Firma güncelleme alanları — logo dahil değil
export const buildCompanyFields = (nextCompany: Record<string, unknown>) => ({
    firma_adi: String(nextCompany.firma_adi || "").trim(),
    web_sitesi: normalizeWebsiteUrl(nextCompany.web_sitesi as string),
    category_name:
        normalizeOptionalString(nextCompany.category_name as string) ||
        "Kurumsal Üye",
    description: normalizeOptionalString(nextCompany.description as string),
    firma_turu: normalizeOptionalString(nextCompany.firma_turu as string),
    telefon: normalizeOptionalString(nextCompany.telefon as string),
    eposta:
        normalizeOptionalString(nextCompany.eposta as string)?.toLowerCase() ||
        null,
    adres: normalizeOptionalString(nextCompany.adres as string),
    latitude: normalizeCoordinate(nextCompany.latitude as number),
    longitude: normalizeCoordinate(nextCompany.longitude as number),
    ana_sektor: normalizeOptionalString(nextCompany.ana_sektor as string),
    urun_kategorileri: JSON.stringify(
        Array.isArray(nextCompany.urun_kategorileri)
            ? nextCompany.urun_kategorileri
            : [],
    ),
    il_ilce: normalizeOptionalString(nextCompany.il_ilce as string),
});

// Enes Doğanay | 23 Mayıs 2026: Admin firma alanları — logo dahil
export const buildAdminCompanyFields = (
    nextCompany: Record<string, unknown>,
) => ({
    ...buildCompanyFields(nextCompany),
    logo_url: normalizeOptionalString(nextCompany.logo_url as string),
});
