import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logDrillCompletion } from '../services/supabase';
import { getDrillById } from '../data/drillLibrary';

export interface DrillPracticeRecord {
  drillId: string;
  practiceDate: string;
  durationMinutes: number;
  notes?: string;
}

export interface SwingAnalysis {
  id: string;
  createdAt: string;
  videoUri?: string;
  rootCause: {
    title: string;
    whyItCausesSlice: string;
    confidence: 'low' | 'medium' | 'high';
    evidence: string[];
  };
  drill: {
    name: string;
    steps: string[];
    reps: string;
    commonMistakes: string[];
  };
  challenge: {
    title: string;
    checklist: string[];
    completedItems: boolean[];
  };
  safetyNote: string;
}

export interface User {
  id: string;
  email?: string;
  appleId?: string;
  createdAt: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  // Subscription
  isSubscribed: boolean;
  subscriptionType: 'monthly' | 'annual' | null;
  trialActive: boolean;
  trialEndDate: string | null;

  // Analysis
  analyses: SwingAnalysis[];
  currentAnalysis: SwingAnalysis | null;
  isAnalyzing: boolean;

  // Drill Practice
  drillPracticeLog: DrillPracticeRecord[];

  // Actions
  setUser: (user: User | null) => void;
  setOnboardingComplete: () => void;
  setSubscription: (type: 'monthly' | 'annual' | null, trial?: boolean, trialEnd?: string) => void;
  addAnalysis: (analysis: SwingAnalysis) => void;
  setCurrentAnalysis: (analysis: SwingAnalysis | null) => void;
  updateChallengeProgress: (analysisId: string, itemIndex: number, completed: boolean) => void;
  deleteAnalysis: (id: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  logDrillPractice: (drillId: string, durationMinutes: number, notes?: string) => void;
  clearAllData: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  isSubscribed: false,
  subscriptionType: null,
  trialActive: false,
  trialEndDate: null,
  analyses: [],
  currentAnalysis: null,
  isAnalyzing: false,
  drillPracticeLog: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setOnboardingComplete: () =>
        set({ hasCompletedOnboarding: true }),

      setSubscription: (type, trial = false, trialEnd) =>
        set({
          isSubscribed: !!type,
          subscriptionType: type,
          trialActive: trial,
          trialEndDate: trialEnd ?? null,
        }),

      addAnalysis: (analysis) =>
        set((state) => ({
          analyses: [analysis, ...state.analyses],
          currentAnalysis: analysis,
        })),

      setCurrentAnalysis: (analysis) =>
        set({ currentAnalysis: analysis }),

      updateChallengeProgress: (analysisId, itemIndex, completed) =>
        set((state) => ({
          analyses: state.analyses.map((a) =>
            a.id === analysisId
              ? {
                  ...a,
                  challenge: {
                    ...a.challenge,
                    completedItems: a.challenge.completedItems.map((c, i) =>
                      i === itemIndex ? completed : c
                    ),
                  },
                }
              : a
          ),
          currentAnalysis:
            state.currentAnalysis?.id === analysisId
              ? {
                  ...state.currentAnalysis,
                  challenge: {
                    ...state.currentAnalysis.challenge,
                    completedItems: state.currentAnalysis.challenge.completedItems.map(
                      (c, i) => (i === itemIndex ? completed : c)
                    ),
                  },
                }
              : state.currentAnalysis,
        })),

      deleteAnalysis: (id) =>
        set((state) => ({
          analyses: state.analyses.filter((a) => a.id !== id),
          currentAnalysis:
            state.currentAnalysis?.id === id ? null : state.currentAnalysis,
        })),

      setIsAnalyzing: (analyzing) =>
        set({ isAnalyzing: analyzing }),

      logDrillPractice: (drillId, durationMinutes, notes) => {
        // Sync to Supabase in background (if user is authenticated)
        const drill = getDrillById(drillId);
        if (drill) {
          logDrillCompletion({
            drill_id: drillId,
            drill_name: drill.name,
            duration_minutes: durationMinutes,
            notes,
          }).catch((err) => console.log('[Store] Drill sync failed (offline?):', err));
        }

        // Always update local state
        set((state) => ({
          drillPracticeLog: [
            {
              drillId,
              practiceDate: new Date().toISOString(),
              durationMinutes,
              notes,
            },
            ...state.drillPracticeLog,
          ],
        }));
      },

      clearAllData: () => set(initialState),
    }),
    {
      name: 'slicefix-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isSubscribed: state.isSubscribed,
        subscriptionType: state.subscriptionType,
        trialActive: state.trialActive,
        trialEndDate: state.trialEndDate,
        analyses: state.analyses,
        drillPracticeLog: state.drillPracticeLog,
      }),
    }
  )
);
