/**
 * Auth Provider for SliceFix AI
 *
 * Provides global auth state to the app:
 * - Current user
 * - Session
 * - Loading state
 * - Auth actions
 *
 * Subscribes to Supabase auth state changes automatically.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import {
  getSession,
  onAuthStateChange,
  signOut as authSignOut,
} from '../services/auth';
import { useAppStore } from '../store/useAppStore';
import { setAnalyticsUserId } from '../services/analytics';

// ============================================
// Types
// ============================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const storeSetUser = useAppStore((s) => s.setUser);

  // Map Supabase user to app user
  const syncUserToStore = useCallback(
    (supabaseUser: User | null) => {
      if (supabaseUser) {
        storeSetUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          createdAt: supabaseUser.created_at,
        });
        setAnalyticsUserId(supabaseUser.id);
      } else {
        storeSetUser(null);
        setAnalyticsUserId(null);
      }
    },
    [storeSetUser]
  );

  // Initialize auth state on mount
  useEffect(() => {
    async function initializeAuth() {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        syncUserToStore(currentSession?.user ?? null);
      } catch (error) {
        console.error('[AuthProvider] Init error:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, [syncUserToStore]);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((event, newSession) => {
      console.log('[AuthProvider] Auth event:', event);

      setSession(newSession);
      setUser(newSession?.user ?? null);
      syncUserToStore(newSession?.user ?? null);

      // Handle specific events
      if (event === 'SIGNED_OUT') {
        // Clear local data on sign out
        // Note: clearAllData is called explicitly in signOut action
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[AuthProvider] Token refreshed successfully');
      }
    });

    return unsubscribe;
  }, [syncUserToStore]);

  // Sign out action
  const signOut = useCallback(async () => {
    try {
      await authSignOut();
      setUser(null);
      setSession(null);
      storeSetUser(null);
      setAnalyticsUserId(null);
    } catch (error) {
      console.error('[AuthProvider] Sign out error:', error);
      throw error;
    }
  }, [storeSetUser]);

  // Refresh auth state
  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      const currentSession = await getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      syncUserToStore(currentSession?.user ?? null);
    } catch (error) {
      console.error('[AuthProvider] Refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [syncUserToStore]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// Utility Hook - Auth Status
// ============================================

export function useAuthStatus() {
  const { user, session, loading } = useAuth();

  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
    session,
  };
}
