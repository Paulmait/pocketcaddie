/**
 * Supabase Server Client - Admin Portal
 *
 * CRITICAL SECURITY NOTES:
 * - This client uses SERVICE_ROLE_KEY which bypasses RLS
 * - It must ONLY be used in:
 *   - Server Components
 *   - Server Actions
 *   - Route Handlers
 * - NEVER import this file in client components
 * - NEVER expose service_role to the browser
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Admin client with service_role - BYPASSES RLS
 * Use for admin operations that need full database access
 * ONLY use in Server Components/Actions/Route Handlers
 */
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Server client for user authentication
 * Uses cookies for session management
 * Respects RLS based on authenticated user
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore errors in Server Components
        }
      },
    },
  });
}

/**
 * Get the currently authenticated admin user
 * Returns null if not authenticated
 */
export async function getAdminUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get admin role for a user
 * Uses service_role to bypass RLS
 */
export async function getAdminRole(userId: string) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('admin_roles')
    .select('role, is_active, last_password_change_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Check if user has MFA enabled
 */
export async function checkMfaEnabled(userId: string) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return false;
  }

  // Check if user has any MFA factors
  const factors = data.user.factors ?? [];
  return factors.some((f) => f.status === 'verified');
}

/**
 * Check if password is fresh (within maxAgeDays)
 * Returns true if:
 * - User uses OAuth/OTP (no password)
 * - User has password and it was changed within maxAgeDays
 */
export async function isPasswordFresh(
  userId: string,
  lastPasswordChange: string | null,
  maxAgeDays: number = 180
): Promise<boolean> {
  // If no password change date, assume OAuth/OTP user
  if (!lastPasswordChange) {
    return true; // OAuth/OTP users don't need password rotation
  }

  const lastChange = new Date(lastPasswordChange);
  const now = new Date();
  const daysSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceChange <= maxAgeDays;
}

/**
 * Write to audit log
 * Must be called for every privileged action
 */
export async function writeAuditLog(params: {
  actorUserId: string;
  actorRole: string;
  action: string;
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  const adminClient = createAdminClient();

  const { data, error } = await adminClient.from('audit_logs').insert({
    actor_user_id: params.actorUserId,
    actor_role: params.actorRole,
    action: params.action,
    target_user_id: params.targetUserId ?? null,
    metadata: params.metadata ?? {},
    ip_hash: params.ipHash ?? null,
    user_agent: params.userAgent ?? null,
  }).select('id').single();

  if (error) {
    console.error('[Audit] Failed to write audit log:', error);
    throw new Error('Failed to write audit log');
  }

  return data.id;
}
