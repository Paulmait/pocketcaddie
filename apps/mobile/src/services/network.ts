/**
 * Network Service
 * Monitors network connectivity and provides offline-first capabilities
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  setNetworkState: (state: Partial<NetworkState>) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  connectionType: null,
  setNetworkState: (newState) => set((state) => ({ ...state, ...newState })),
}));

let unsubscribe: NetInfoSubscription | null = null;

export const initNetworkMonitoring = (): void => {
  if (unsubscribe) return;

  unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    useNetworkStore.getState().setNetworkState({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      connectionType: state.type,
    });
  });
};

export const stopNetworkMonitoring = (): void => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

export const checkNetworkStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
};

export const waitForConnection = async (timeoutMs: number = 30000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const isOnline = await checkNetworkStatus();
    if (isOnline) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
};
