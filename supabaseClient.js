import { createClient } from "@supabase/supabase-js";

// Remplace ces deux valeurs par celles de ton projet Supabase
// (Project Settings > API dans le tableau de bord Supabase)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
