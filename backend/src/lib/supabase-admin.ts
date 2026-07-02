import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Use service role key for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// For verifying user tokens
export const supabaseAuth = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || ""
);
