import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuration Supabase - utilise les variables d'environnement avec fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dhuuduphwvxrecfqvbbw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRodXVkdXBod3Z4cmVjZnF2YmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTEyODksImV4cCI6MjA4Mzc4NzI4OX0.RyURwma808AT0PqFIWXpe6NIdIdoscYN5GiC8Dh7Ktk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});