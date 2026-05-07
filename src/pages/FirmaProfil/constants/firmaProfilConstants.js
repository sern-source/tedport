// Enes Doğanay | 6 Mayıs 2026: FirmaProfil sabit değerleri

/* Enes Doğanay | 6 Mayıs 2026: Kurumsal bildirim tercih listesi */
export const FIRMA_NOTIF_PREFS_LIST = [
  { key: 'teklif_talepleri', icon: 'request_quote', label: 'Teklif Talepleri', desc: 'Yeni teklif talebi geldiğinde bildirim al' },
  { key: 'teklif_yanitlari', icon: 'reply', label: 'Teklif Yanıtları', desc: 'Teklif taleplerinize yanıt geldiğinde bildirim al' },
  { key: 'teklif_mesajlari', icon: 'chat', label: 'Teklif Mesajları', desc: 'Teklif sohbetlerinde yeni mesaj geldiğinde bildirim al' },
  { key: 'hatirlatmalar', icon: 'alarm', label: 'Hatırlatmalar', desc: 'Zamanlanmış hatırlatmalarınız geldiğinde bildirim al' },
  { key: 'ihale_teklifleri', icon: 'gavel', label: 'İhale Teklifleri', desc: 'İhalelerinize yeni teklif geldiğinde bildirim al' },
  { key: 'ihale_durum_degisiklikleri', icon: 'swap_horiz', label: 'İhale Durum Değişiklikleri', desc: 'İhale tekliflerinizin durumu değiştiğinde bildirim al' },
  { key: 'ihale_teklif_mesajlari', icon: 'forum', label: 'İhale Teklif Mesajları', desc: 'İhale teklifleriniz üzerinden gelen mesajlarda bildirim al' },
  { key: 'anlik_bildirimler', icon: 'notifications_active', label: 'Anlık Bildirimler (Pop-up)', desc: "Ekranda anlık bildirim pop-up'ları gösterilsin" },
];

/* Enes Doğanay | 6 Mayıs 2026: Header navigasyon linkleri */
export const NAV_ITEMS = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Firmalar', href: '/firmalar' },
  { label: 'İhaleler', href: '/ihaleler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim', href: '/iletisim' },
];

/* Enes Doğanay | 6 Mayıs 2026: Teklif durumu sıralama önceliği */
export const QUOTE_STATUS_SORT = {
  pending: 0,
  awaiting_reply: 1,
  read: 2,
  replied: 3,
  closed: 4,
  rejected: 5,
};
