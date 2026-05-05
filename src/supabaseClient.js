import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://gsdbutprqfnxjtppwwhn.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZGJ1dHBycWZueGp0cHB3d2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTE0NDgsImV4cCI6MjA3OTU4NzQ0OH0.jls3ReKBV5vRljairmDd72OzAYGl6qHCewjA6P_RAq8';

// Enes Doğanay | 6 Nisan 2026: Beni Hatırla durumuna göre auth session'i localStorage veya sessionStorage'a yaz
const authProjectRef = new URL(supabaseUrl).host.split('.')[0];
const authStorageKey = `sb-${authProjectRef}-auth-token`;
const authStorageModeKey = 'tedport-auth-storage-mode';
const isBrowser = typeof window !== 'undefined';

const getActiveStorage = () => {
  if (!isBrowser) return null;

  const sessionMode = window.sessionStorage.getItem(authStorageModeKey);
  if (sessionMode === 'session') {
    return window.sessionStorage;
  }

  const localMode = window.localStorage.getItem(authStorageModeKey);
  if (localMode === 'local') {
    return window.localStorage;
  }

  return window.localStorage;
};

const authStorage = {
  getItem(key) {
    if (!isBrowser) return null;

    // Enes Doğanay | 5 Mayıs 2026: sessionStorage HER ZAMAN önce okunur — TAB İZOLASYONU.
    // Problem: iki farklı hesap aynı browsera giriş yaparsa, biri token refresh yaptığında
    // localStorage'daki token'ı overwrite eder. Supabase JS storage event alır, iç session'ını
    // diğer kullanıcıya günceller → tüm DB sorguları yanlış JWT'yle gider → RLS patlıyor.
    // Çözüm: localStorage'dan ilk okumada sessionStorage'a kopyala (tab-specific isolation).
    // Supabase JS, storage event'te kendi getItem()'ımızı çağırır → sessionStorage döner → bypass.
    const sessionValue = window.sessionStorage.getItem(key);
    if (sessionValue) return sessionValue;

    // localStorage'dan ilk okuma — bu tab'ın kendi sessionStorage'ına kopyala
    const localValue = window.localStorage.getItem(key);
    if (localValue) {
      window.sessionStorage.setItem(key, localValue); // tab izolasyonu başlıyor
    }
    return localValue;
  },
  setItem(key, value) {
    if (!isBrowser) return;

    // Her zaman sessionStorage'a yaz — tab'a özel, cross-tab overwrite'a karşı bağışık
    window.sessionStorage.setItem(key, value);

    // "Beni Hatırla" modunda localStorage'a da yaz (yeni sekme açılınca restore için)
    const mode = window.sessionStorage.getItem(authStorageModeKey) || window.localStorage.getItem(authStorageModeKey);
    if (mode === 'local') {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  },
  removeItem(key) {
    if (!isBrowser) return;

    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);

    if (key === authStorageKey) {
      window.localStorage.removeItem(authStorageModeKey);
      window.sessionStorage.removeItem(authStorageModeKey);
    }
  }
};

export const setAuthPersistenceMode = (rememberMe) => {
  if (!isBrowser) return;

  // Enes Doğanay | 6 Nisan 2026: Yeni login oncesi eski storage'daki auth token temizlenir
  window.localStorage.removeItem(authStorageKey);
  window.sessionStorage.removeItem(authStorageKey);

  if (rememberMe) {
    window.sessionStorage.removeItem(authStorageModeKey);
    window.localStorage.setItem(authStorageModeKey, 'local');
    return;
  }

  window.localStorage.removeItem(authStorageModeKey);
  window.sessionStorage.setItem(authStorageModeKey, 'session');
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    /* Enes Doğanay | 5 Mayıs 2026: Global fetch timeout — token refresh veya DB sorgusu asılı kalırsa
     * AbortError fırlatarak sayfaların loading'de kalmasını önler.
     * Auth istekleri (token refresh) 30s — genuinely yavaş olabilir.
     * REST API (DB sorguları) 10s — daha hızlı feedback, kullanıcı donma yaşamaz. */
    global: {
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        // Enes Doğanay | 5 Mayıs 2026: Supabase kendi abort signal'i gönderirse bizimkini de tetikle
        const originalSignal = options.signal;
        if (originalSignal) {
          originalSignal.addEventListener('abort', () => controller.abort(), { once: true });
        }
        // Enes Doğanay | 5 Mayıs 2026: Auth istekleri 30s, REST sorguları 10s — farklı kritiklik
        const isAuthRequest = typeof url === 'string' && url.includes('/auth/v1/');
        const timeoutMs = isAuthRequest ? 30000 : 10000;
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timeout));
      }
    },
    // Enes Doğanay | 9 Nisan 2026: Realtime bağlantısı için gerekli config — RLS filtreleme ve broadcast
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
