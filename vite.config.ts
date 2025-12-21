
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // mode: 'production' veya 'development'
  // (process as any).cwd() ile mevcut dizindeki .env dosyalarını yükler
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Gemini SDK'nın beklediği process.env.API_KEY yapısını oluşturuyoruz
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
      // Supabase için process.env üzerinden erişim sağlıyoruz
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY),
    }
  };
});
