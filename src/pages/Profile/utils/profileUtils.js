// Enes Doğanay | 6 Mayıs 2026: Profile sayfası yardımcı saf fonksiyonlar

export const isMissingRelationError = (error) =>
  error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

export const hashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`;
};

export const getLatestNote = (notes, firmaId) =>
  (notes || [])
    .filter((n) => n.firma_id === firmaId)
    .sort((a, b) =>
      (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || '')
    )[0];

export const getAllNotesForFirma = (notes, firmaId) =>
  (notes || [])
    .filter((n) => n.firma_id === firmaId)
    .sort((a, b) =>
      (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || '')
    );

export const parseNotePayload = (raw) => {
  if (!raw) return { title: '', tag: '', body: '' };
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === 'object' && 'body' in p) {
      return { title: p.title || '', tag: p.tag || '', body: p.body || '' };
    }
  } catch {
    // eski düz metin notlar
  }
  return { title: '', tag: '', body: raw };
};

export const serializeNotePayload = (title, tag, body) =>
  JSON.stringify({ title: title || '', tag: tag || '', body: body || '' });

export const formatReminderLabel = (isoValue) => {
  if (!isoValue) return '';
  const d = new Date(isoValue);
  return `${d.toLocaleDateString('tr-TR')} • ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatRelativeNotificationTime = (isoValue) => {
  if (!isoValue) return '';
  const diffMin = Math.round((Date.now() - new Date(isoValue).getTime()) / 60000);
  if (Math.abs(diffMin) < 1) return 'Az önce';
  if (Math.abs(diffMin) < 60) return `${Math.abs(diffMin)} dk ${diffMin >= 0 ? 'önce' : 'sonra'}`;
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return `${Math.abs(diffH)} sa ${diffH >= 0 ? 'önce' : 'sonra'}`;
  const diffD = Math.round(diffH / 24);
  return `${Math.abs(diffD)} gün ${diffD >= 0 ? 'önce' : 'sonra'}`;
};

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
  tender_offer_message: 'ihale_teklif_mesajlari',
};

export const NOTIF_LIMIT = 3;
