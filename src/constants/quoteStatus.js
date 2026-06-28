// Enes Doğanay | 28 Haziran 2026: Teklif talebi durum etiketleri — QuoteCard, QuoteChatHeader, QuoteChatView paylaşımlı
// Gelen teklifler (alıcı firma perspektifinden)
export const QUOTE_STATUS_LABELS_IN = {
    pending:        'Yeni',
    read:           'Okundu',
    replied:        'Yanıtlandı',
    awaiting_reply: 'Yanıt Bekleniyor',
    rejected:       'Reddedildi',
    closed:         'Sonlandırıldı',
};

// Giden teklifler (teklif gönderen perspektifinden)
export const QUOTE_STATUS_LABELS_OUT = {
    pending:        'Beklemede',
    read:           'Firma Görüntüledi',
    replied:        'Yanıt Geldi',
    awaiting_reply: 'Yanıt Bekleniyor',
    rejected:       'Reddedildi',
    closed:         'Sonlandırıldı',
};
