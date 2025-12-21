
import { createClient } from '@supabase/supabase-js';

/**
 * ÖNEMLİ: Vite 'define' özelliğini kullandığı için process.env.DEGISKEN_ADI 
 * ifadesini kodun içinde tam olarak (as any kullanmadan) yazmalıyız. 
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Eğer anahtarlar eksikse createClient hata fırlatır. 
// Bu yüzden anahtarların varlığını kontrol ediyoruz ve yoksa kullanıcıyı uyarıyoruz.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "HATA: Supabase bağlantı anahtarları bulunamadı!\n" +
    "Lütfen .env dosyanızda VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.\n" +
    "Uygulama düzgün çalışmayabilir."
  );
}

// createClient'ın 'is required' hatası vermemesi için boş değer gelirse 
// placeholder gönderiyoruz, ancak yukarıdaki konsol hatası asıl sorunu işaret edecektir.
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co', 
  supabaseAnonKey || 'missing-key'
);
