// Enes Doğanay | 6 Mayıs 2026: Auth servisi — tüm Supabase auth çağrıları
import { supabase, setAuthPersistenceMode } from '../../../supabaseClient';

export const signIn = async (email, password, rememberMe) => {
  // Enes Doğanay | 7 Mayıs 2026: Mevcut oturumun in-memory state'ini temizle — storage temizlenmeden
  // önce Supabase client bellekte eski session'ı tutuyordu, bu yeni girişi bloke ediyordu
  try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* yeni giriş için sessizce geç */ }
  setAuthPersistenceMode(rememberMe);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const sendPasswordResetEmail = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

export const updatePassword = async (password) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const signInWithOAuth = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
};

export const resendConfirmEmail = async (email) => {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
};

export const getOwnerFirma = async (userId) => {
  const { data } = await supabase
    .from('kurumsal_firma_yoneticileri')
    .select('firma_id')
    .eq('user_id', userId)
    .eq('role', 'owner')
    .maybeSingle();
  return data?.firma_id || null;
};

export const subscribeAuthState = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
