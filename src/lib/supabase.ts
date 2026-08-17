import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fubqiwdrwgbhyxokqnuh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nMTUTKOqBKoQnf3Xer51uw_KhaRKvLw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env config.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
