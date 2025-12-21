
import { createClient } from '@supabase/supabase-js';

// Vite config içindeki 'define' bloğu sayesinde bu değerler build anında dolacaktır.
const supabaseUrl = (process.env as any).VITE_SUPABASE_URL;
const supabaseAnonKey = (process.env as any).VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.error(
    "CRITICAL ERROR: Supabase bağlantı bilgileri bulunamadı!\n" +
    "AWS EC2 ortamında derleme (build) yapmadan önce .env dosyasını kontrol edin veya " +
    "ortam değişkenlerini (Environment Variables) tanımlayın."
  );
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
