
import { createClient } from '@supabase/supabase-js';

// Verilen Supabase Proje Bilgileri
const supabaseUrl = 'https://maecmjkmrgdvnskgcgii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZWNtamttcmdkdm5za2djZ2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzYxNTMsImV4cCI6MjA4MTMxMjE1M30._WwhYqpPNtsBrad4rFEG4eQBAv4HEzo_18JSpxNtog4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
