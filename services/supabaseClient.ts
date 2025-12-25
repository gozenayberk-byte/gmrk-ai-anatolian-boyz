
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

// Bağlantı anahtarlarının geçerli olup olmadığını kontrol et
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseUrl.includes('supabase.co') && supabaseAnonKey);
};

// Eğer anahtarlar yoksa, dummy (sahte) bir URL ile başlatarak SDK'nın çökmesini önle.
// storageService bu durumda otomatik olarak LocalStorage (Mock Modu) kullanacaktır.
const safeUrl = isSupabaseConfigured() ? supabaseUrl : 'https://unconfigured.supabase.co';
const safeKey = isSupabaseConfigured() ? supabaseAnonKey : 'unconfigured';

if (!isSupabaseConfigured()) {
  console.warn(
    "GümrükAI: Supabase bağlantı anahtarları eksik. \n" +
    "Uygulama şu an 'Yerel Mod'da çalışıyor (Veriler tarayıcınızda saklanır).\n" +
    "Bulut tabanlı kayıt ve kullanıcı yönetimi için .env dosyanıza VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin."
  );
}

export const supabase = createClient(safeUrl, safeKey);
