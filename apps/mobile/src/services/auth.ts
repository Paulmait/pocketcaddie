/**
 * Authentication Service for SliceFix AI
 *
 * Provides typed auth functions for:
 * - Email Magic Link (OTP)
 * - Sign in with Apple (iOS only)
 * - Session management
 * - Account deletion
 *
 * All functions use only the anon key. No service_role in client.
 */

import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './supabase';

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string;
  email: string | undefined;
  appleId?: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

export type AuthStateCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

// ============================================
// Session Management
// ============================================

/**
 * Get the current session if it exists
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[Auth] getSession error:', error.message);
    return null;
  }
  return session;
}

/**
 * Get the current user if authenticated
 */
export async function getUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('[Auth] getUser error:', error.message);
    return null;
  }
  return user;
}

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export function onAuthStateChange(callback: AuthStateCallback): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// ============================================
// Email OTP Authentication
// ============================================

/**
 * Send a magic link / OTP code to the user's email
 */
export async function signInWithEmailOtp(email: string): Promise<AuthResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.toLowerCase().trim(),
    options: {
      shouldCreateUser: true,
      // Deep link for magic link (when user clicks email link)
      emailRedirectTo: 'slicefix://login',
    },
  });

  if (error) {
    console.error('[Auth] signInWithEmailOtp error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Verify the OTP code sent to user's email
 */
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<AuthResult> {
  if (!token || token.length < 6) {
    return { success: false, error: 'Please enter the 6-digit code' };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token: token.trim(),
    type: 'email',
  });

  if (error) {
    console.error('[Auth] verifyEmailOtp error:', error.message);
    return { success: false, error: 'Invalid or expired code. Please try again.' };
  }

  if (!data.user) {
    return { success: false, error: 'Verification failed. Please try again.' };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
    session: data.session ? mapSupabaseSession(data.session) : undefined,
  };
}

// ============================================
// Apple Sign In (iOS only)
// ============================================

/**
 * Sign in with Apple using identity token
 * Must be called after AppleAuthentication.signInAsync()
 */
export async function signInWithApple(
  identityToken: string,
  nonce: string
): Promise<AuthResult> {
  if (!identityToken) {
    return { success: false, error: 'Apple Sign In failed: No identity token' };
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
    nonce,
  });

  if (error) {
    console.error('[Auth] signInWithApple error:', error.message);
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Apple Sign In failed. Please try again.' };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
    session: data.session ? mapSupabaseSession(data.session) : undefined,
  };
}

// ============================================
// Sign Out
// ============================================

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Auth] signOut error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// Account Deletion
// ============================================

/**
 * Request account deletion
 * Calls the delete-account Edge Function
 */
export async function requestAccountDeletion(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.functions.invoke('delete-account');

    if (error) {
      console.error('[Auth] requestAccountDeletion error:', error.message);
      return { success: false, error: error.message };
    }

    // Sign out after successful deletion
    await supabase.auth.signOut();

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete account';
    console.error('[Auth] requestAccountDeletion exception:', message);
    return { success: false, error: message };
  }
}

// ============================================
// Helpers
// ============================================

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
  };
}

function mapSupabaseSession(session: Session): AuthSession {
  return {
    user: mapSupabaseUser(session.user),
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
  };
}

// ============================================
// Refresh Token Helper
// ============================================

/**
 * Manually refresh the session token
 */
export async function refreshSession(): Promise<AuthResult> {
  const { data, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('[Auth] refreshSession error:', error.message);
    return { success: false, error: error.message };
  }

  if (!data.session) {
    return { success: false, error: 'Failed to refresh session' };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.session.user),
    session: mapSupabaseSession(data.session),
  };
}
