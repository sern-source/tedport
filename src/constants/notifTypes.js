// Enes Doğanay | 6 Mayıs 2026: Bildirim tipi → tercih key eşleştirmesi
// Enes Doğanay | 7 Mayıs 2026: Şirket taraflı teklif bildirimi tipleri — firma_id'li, sadece firma sayfasında gösterilir
export const COMPANY_TENDER_TYPES = ['tender_new_offer', 'tender_offer_updated', 'tender_offer_withdrawn'];

export const NOTIF_TYPE_TO_PREF_KEY = {
    quote_received: 'teklif_talepleri',
    quote_reply: 'teklif_yanitlari',
    quote_message: 'teklif_mesajlari',
    reminder: 'hatirlatmalar',
    tender_new_offer: 'ihale_teklifleri',
    tender_offer_updated: 'ihale_teklifleri',
    tender_offer_withdrawn: 'ihale_teklifleri',
    tender_offer_status: 'ihale_durum_degisiklikleri',
    tender_updated: 'ihale_durum_degisiklikleri',
    tender_closed: 'ihale_durum_degisiklikleri',
    tender_cancelled: 'ihale_durum_degisiklikleri',
    // Enes Doğanay | 7 Mayıs 2026: İhale teklif mesajlaşma bildirimi — doğru pref key: ihale_teklif_mesajlari
    tender_offer_message: 'ihale_teklif_mesajlari',
};
