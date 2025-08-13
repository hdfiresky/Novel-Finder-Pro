import { createClient } from '@supabase/supabase-js';

// It's crucial to use environment variables for these keys
// to avoid exposing them in the client-side code.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In a real app, you might want to show a more user-friendly message
  // or have a specific state for when Supabase is not configured.
  // For this project, we'll log an error which is helpful during development.
  console.error("Supabase URL or Anon Key is not set. Please create the required environment variables.");
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
