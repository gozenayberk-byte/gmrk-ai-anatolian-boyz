
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Explicitly import process to fix TypeScript error regarding property 'cwd' on type 'Process'
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Mevcut dizindeki ortam değişkenlerini yükle (.env dosyasını okur).
  // Use process.cwd() from the imported process module to get the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // API_KEY artık kodun içine gömülmek yerine ortam değişkeninden alınır.
      // Build sırasında veya dev modunda sistemdeki API_KEY değerini kullanır.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ""),
    }
  };
});
