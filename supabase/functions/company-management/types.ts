// Enes Doğanay | 23 Mayıs 2026: Firma yönetim edge function tip tanımları

export type CompanyInput = {
    firma_adi: string;
    web_sitesi?: string | null;
    category_name?: string | null;
    description?: string | null;
    firma_turu?: string | null;
    telefon?: string | null;
    eposta?: string | null;
    adres?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    ana_sektor?: string | null;
    urun_kategorileri?: unknown;
    logo_url?: string | null;
    il_ilce?: string | null;
};

export type CompanyManagementPayload =
    | { action: "get_my_company" }
    | { action: "update_my_company"; company: CompanyInput }
    /* Enes Doğanay | 13 Nisan 2026: Admin logo güncelleme action'ı */
    | { action: "admin_update_logo"; firmaID: string; logo_url: string | null }
    /* Enes Doğanay | 13 Nisan 2026: Admin firma getirme action'ı */
    | { action: "admin_get_company"; firmaID: string }
    /* Enes Doğanay | 13 Nisan 2026: Admin firma güncelleme action'ı */
    | { action: "admin_update_company"; firmaID: string; company: CompanyInput }
    /* Enes Doğanay | 13 Nisan 2026: Admin yeni firma ekleme action'ı */
    | { action: "admin_create_company"; company: CompanyInput }
    /* Enes Doğanay | 13 Nisan 2026: Admin firma silme action'ı */
    | { action: "admin_delete_company"; firmaID: string }
    /* Enes Doğanay | 23 Mayıs 2026: Teklif İste — firma + ekibe bildirim maili */
    | {
        action: "send_quote_request_email";
        firma_id: string;
        teklif_id?: string;
        requester_name: string;
        konu: string;
        mesaj: string;
    };
