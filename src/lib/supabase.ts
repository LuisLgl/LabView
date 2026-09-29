import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzlsjpgoiqrygzbpjwnq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_D8Jm-T5DW3NsawFxEKz4TA_KiJPamBL';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
