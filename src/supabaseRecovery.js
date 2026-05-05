// Enes Doğanay | 5 Mayıs 2026: Supabase bağlantı kurtarma yardımcıları
// Geçici ağ hatalarını tespit etmek, query timeout eklemek ve bağlantı geri
// gelince otomatik yenileme yapmak için paylaşılan utility modülü.

/* ── Timeout ile query çalıştır ───────────────────────────────────────────── */
/**
 * Bir Supabase query builder'ı belirli sürede tamamlamazsa
 * timeout hatası fırlatır / {data:null, error} döner.
 *
 * @param {PromiseLike} queryPromise   - supabase...select() gibi bir promise
 * @param {string}      label          - hata loglaması için açıklama
 * @param {number}      [ms=12000]     - timeout süresi (ms)
 * @returns {Promise<{data: any, error: Error|null}>}
 */
export async function runSupabaseQueryWithTimeout(queryPromise, label = 'query', ms = 12000) {
  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(`[supabaseRecovery] Timeout: "${label}" sorgusu ${ms}ms içinde tamamlanamadı.`));
    }, ms);
  });

  try {
    const result = await Promise.race([queryPromise, timeoutPromise]);
    clearTimeout(timerId);
    return result;
  } catch (err) {
    clearTimeout(timerId);
    // Timeout hatası — Supabase { data, error } formatına dönüştür
    return { data: null, error: err };
  }
}

/* ── Geçici hata tespiti ──────────────────────────────────────────────────── */
const RECOVERABLE_PATTERNS = [
  'fetch',
  'network',
  'timeout',
  'abort',
  'failed to fetch',
  'load failed',
  'networkerror',
  'connection',
  'econnreset',
  'enotfound',
  'etimedout',
  'socket',
];

/**
 * Bir hatanın geçici ağ / bağlantı hatası olup olmadığını kontrol eder.
 * true ise kullanıcıya "bağlantı geri gelince yeniden denenecek" mesajı gösterilebilir.
 */
export function isRecoverableSupabaseError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return RECOVERABLE_PATTERNS.some(p => msg.includes(p));
}

/* ── Bağlantı event bus ───────────────────────────────────────────────────── */
const listeners = new Set();

function emit(status) {
  listeners.forEach(cb => {
    try { cb({ status }); } catch { /* ignore */ }
  });
}

// Tarayıcı online/offline olaylarını dinle
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => emit('restored'));
  window.addEventListener('offline', () => emit('lost'));
}

/**
 * Supabase bağlantı durum olaylarına abone ol.
 * Callback'e { status: 'restored' | 'lost' } objesi iletilir.
 *
 * @param {(event: {status: string}) => void} callback
 * @returns {() => void}  Aboneliği iptal eden unsubscribe fonksiyonu
 */
export function onSupabaseConnectionEvent(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
