import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gsdbutprqfnxjtppwwhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzZGJ1dHBycWZueGp0cHB3d2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTE0NDgsImV4cCI6MjA3OTU4NzQ0OH0.jls3ReKBV5vRljairmDd72OzAYGl6qHCewjA6P_RAq8';

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

    const sessionMode = window.sessionStorage.getItem(authStorageModeKey);
    if (sessionMode === 'session') {
      return window.sessionStorage.getItem(key);
    }

    const localMode = window.localStorage.getItem(authStorageModeKey);
    if (localMode === 'local') {
      return window.localStorage.getItem(key);
    }

    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem(key, value) {
    if (!isBrowser) return;

    const activeStorage = getActiveStorage();
    if (!activeStorage) return;

    activeStorage.setItem(key, value);

    if (activeStorage === window.localStorage) {
      window.sessionStorage.removeItem(key);
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
    }
  }
);
