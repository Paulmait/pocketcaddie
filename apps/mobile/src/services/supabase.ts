import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Environment variables - replace with your Supabase project details
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom storage adapter for Expo
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export const signInWithApple = async (identityToken: string, nonce: string) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
    nonce,
  });

  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) throw error;
  return data;
};

export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const deleteAccount = async () => {
  // This should call an edge function that handles account deletion
  const { data, error } = await supabase.functions.invoke('delete-account');
  if (error) throw error;
  return data;
};

// Storage helpers
export const uploadVideo = async (uri: string, userId: string) => {
  const fileName = `${userId}/${Date.now()}.mp4`;

  // Convert URI to blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, blob, {
      contentType: 'video/mp4',
    });

  if (error) throw error;
  return data;
};

export const deleteVideo = async (path: string) => {
  const { error } = await supabase.storage
    .from('videos')
    .remove([path]);

  if (error) throw error;
};

export const getVideoUrl = async (path: string) => {
  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(path);

  return data.publicUrl;
};

// Drill tracking helpers
export interface DrillCompletion {
  id?: string;
  user_id?: string;
  drill_id: string;
  drill_name: string;
  duration_minutes: number;
  notes?: string;
  completed_at?: string;
}

export const logDrillCompletion = async (completion: Omit<DrillCompletion, 'id' | 'user_id' | 'completed_at'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('drill_completions')
    .insert({
      user_id: user.id,
      drill_id: completion.drill_id,
      drill_name: completion.drill_name,
      duration_minutes: completion.duration_minutes,
      notes: completion.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error logging drill completion:', error);
    return null;
  }
  return data;
};

export const getDrillCompletions = async (limit = 50) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('drill_completions')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[Supabase] Error fetching drill completions:', error);
    return [];
  }
  return data || [];
};

export const getDrillStats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalCompletions: 0, totalMinutes: 0, drillCounts: {} };

  const { data, error } = await supabase
    .from('drill_completions')
    .select('drill_id, drill_name, duration_minutes')
    .eq('user_id', user.id);

  if (error) {
    console.error('[Supabase] Error fetching drill stats:', error);
    return { totalCompletions: 0, totalMinutes: 0, drillCounts: {} };
  }

  const completions = data || [];
  const drillCounts: Record<string, number> = {};
  let totalMinutes = 0;

  completions.forEach((c) => {
    drillCounts[c.drill_id] = (drillCounts[c.drill_id] || 0) + 1;
    totalMinutes += c.duration_minutes || 0;
  });

  return {
    totalCompletions: completions.length,
    totalMinutes,
    drillCounts,
  };
};
