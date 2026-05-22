import { createClient } from '@supabase/supabase-js';

// Enes Doğanay | 22 Mayıs 2026: Hardcoded değerler → .env.local NEXT_PUBLIC_ değişkenlerine taşındı
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Enes Doğanay | 6 Nisan 2026: Beni Hatırla durumuna göre auth session'i localStorage veya sessionStorage'a yaz
// Enes Doğanay | 23 Mayıs 2026: SSR güvenli — supabaseUrl undefined olduğunda new URL() patlamasın
const authProjectRef = supabaseUrl ? new URL(supabaseUrl).host.split('.')[0] : '';
const authStorageKey = `sb-${authProjectRef}-auth-token`;
const authStorageModeKey = 'tedport-auth-storage-mode';
const isBrowser = typeof window !== 'undefined';

// Enes Doğanay | 7 Mayıs 2026: Supabase cross-tab session corruption düzeltmesi.
// Supabase JS v2, window'daki 'storage' event'ini dinler ve event.newValue'yi DOĞRUDAN okur
// (custom storage adapter'ı bypass eder). Farklı sekmede farklı kullanıcı oturum açıkken
// token refresh veya logout yaptığında localStorage değişir → diğer sekmedeki Supabase
// farklı/null token görür → _removeSession() çağırır → o sekmenin sessionStorage'ını siler
// → SIGNED_OUT fırlatır → o kullanıcının girişi kopar.
// Çözüm: capture phase'de storage event'i yakala, auth key için stopImmediatePropagation()
// ile Supabase'in bubble-phase listener'ına ulaşmasını engelle.
// Her sekme zaten kendi sessionStorage'ını yönetiyor (tab izolasyonu), cross-tab sync gerekmez.
if (isBrowser) {
  window.addEventListener('storage', (e) => {
    if (e.key === authStorageKey) e.stopImmediatePropagation();
  }, true); // capture phase — Supabase'in bubble-phase listener'ından önce çalışır
}

const authStorage = {
  getItem(key) {
    if (!isBrowser) return null;

    // Enes Doğanay | 5 Mayıs 2026: sessionStorage HER ZAMAN önce okunur — TAB İZOLASYONU.
    // Her sekme kendi sessionStorage'ını tutar. localStorage sadece ilk açılışta (rememberMe)
    // bootstrap için okunur ve sessionStorage'a kopyalanır. Cross-tab sync yukarıdaki
    // capture-phase listener tarafından engellendi.
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
