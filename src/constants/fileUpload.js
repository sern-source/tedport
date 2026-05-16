// Enes Doğanay | 16 Mayıs 2026: İzin verilen ek dosya türleri — B2B teknik döküman
// Görsel (jpg/png/gif) kasıtlı olarak dışarıda bırakıldı; teklif/talep akışında iş belgesi bekleniyor.

export const ALLOWED_EK_DOSYA_UZANTILARI = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip']);

export const ALLOWED_EK_DOSYA_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.zip';

export const ALLOWED_EK_DOSYA_ETIKET = 'PDF, Word, Excel veya ZIP';

export const ALLOWED_EK_DOSYA_HATA =
    'Geçersiz dosya türü. Sadece PDF, Word, Excel ve ZIP yüklenebilir.';
