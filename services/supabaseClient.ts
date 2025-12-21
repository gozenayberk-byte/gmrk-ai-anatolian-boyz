
import { createClient } from '@supabase/supabase-js';

// Use process.env cast to any to avoid TypeScript errors for non-standard environments
const supabaseUrl = (process.env as any).VITE_SUPABASE_URL || 'https://maecmjkmrgdvnskgcgii.supabase.co';
const supabaseAnonKey = (process.env as any).VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZWNtamttcmdkdm5za2djZ2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzYxNTMsImV4cCI6MjA4MTMxMjE1M30._WwhYqpPNtsBrad4rFEG4eQBAv4HEzo_18JSpxNtog4';

if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.warn("Supabase URL tanımlanmamış. Yerel veritabanı modunda çalışılacak.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
