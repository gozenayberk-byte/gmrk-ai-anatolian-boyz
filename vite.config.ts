
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Mevcut dizindeki ortam değişkenlerini yükle. 
  // Üçüncü parametre olan '' (boş string), tüm değişkenleri (VITE_ olsun olmasın) okumamızı sağlar.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Vite, kod içinde bu tam ifadeleri bulduğunda değerleri yerlerine yazar.
      // process.env.API_KEY gibi erişimler için nesne yapısını koruyoruz.
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || ""),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ""),
    }
  };
});
