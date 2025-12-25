
import { createClient } from '@supabase/supabase-js';

// Vite define block allows process.env access, fallback to empty string
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  // Check if keys are present and look valid (url contains supabase.co)
  return Boolean(
    supabaseUrl && 
    supabaseUrl.length > 10 && 
    supabaseUrl.includes('supabase.co') && 
    supabaseAnonKey && 
    supabaseAnonKey.length > 20
  );
};

const safeUrl = isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-project.supabase.co';
const safeKey = isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-key-not-set';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Bilgilendirme logu (Geliştirme aşamasında yardımcı olması için)
if (!isSupabaseConfigured()) {
  console.warn("Supabase API anahtarları henüz yüklenmemiş veya geçersiz. Lütfen .env dosyasını ve build sürecini kontrol edin.");
}
