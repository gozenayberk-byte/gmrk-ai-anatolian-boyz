
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_GOOGLE_API_KEY || ""),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ""),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ""),
      'process.env.VITE_IYZICO_API_KEY': JSON.stringify(env.VITE_IYZICO_API_KEY || ""),
      'process.env.VITE_IYZICO_SECRET_KEY': JSON.stringify(env.VITE_IYZICO_SECRET_KEY || ""),
      'process.env.VITE_IYZICO_BASE_URL': JSON.stringify(env.VITE_IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"),
    }
  };
});
