/**
 * Supabase Browser Client - Admin Portal
 *
 * This client uses ONLY the anon key for authentication.
 * It is used in client components for login UI.
 *
 * SECURITY NOTE:
 * - This client NEVER has access to service_role
 * - All admin operations must go through Server Actions
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
