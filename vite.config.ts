
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Mevcut dizindeki ortam değişkenlerini yükle (Supabase vb. için).
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Gemini API Key doğrudan buraya gömüldü. 
      // Kod içerisinde process.env.API_KEY olarak erişilmeye devam edilecek, 
      // bu da SDK standartlarına uyumu korur.
      'process.env.API_KEY': JSON.stringify("AIzaSyA6D33u-y0kGmBsAi6XVVpehNdxkr1C3tY"),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ""),
    }
  };
});
