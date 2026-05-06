import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jfadyeefcuynprqqltsg.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_OurPz9gFB-RUDH0tSWzlMQ_B75AMOr0";

export const supabase = createClient(supabaseUrl, supabaseKey);
