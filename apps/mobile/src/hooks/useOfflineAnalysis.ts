/**
 * Offline Analysis Hook
 * Provides offline-first swing analysis with queue management
 */

import { useState, useEffect, useCallback } from 'react';
import { useNetworkStore } from '../services/network';
import {
  QueueState,
  QueuedUpload,
  addToQueue,
  processQueue,
  subscribeToQueue,
  retryQueueItem,
  removeFromQueue,
  getQueueStatus,
} from '../services/uploadQueue';
import { getMockAnalysis } from '../services/analysis';
import { useAppStore, SwingAnalysis } from '../store/useAppStore';

export type AnalysisMode = 'online' | 'offline' | 'queued';

interface UseOfflineAnalysisReturn {
  analyzeVideo: (videoUri: string) => Promise<{ analysis: SwingAnalysis; mode: AnalysisMode }>;
  queueState: QueueState;
  isOnline: boolean;
  pendingCount: number;
  retryUpload: (id: string) => Promise<void>;
  cancelUpload: (id: string) => Promise<void>;
  processQueuedItems: () => Promise<void>;
}

export const useOfflineAnalysis = (): UseOfflineAnalysisReturn => {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const { user, addAnalysis } = useAppStore();

  const [queueState, setQueueState] = useState<QueueState>({
    items: [],
    isProcessing: false,
  });

  const isOnline = isConnected && isInternetReachable !== false;

  useEffect(() => {
    const unsubscribe = subscribeToQueue(setQueueState);
    return unsubscribe;
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline]);

  const analyzeVideo = useCallback(
    async (videoUri: string): Promise<{ analysis: SwingAnalysis; mode: AnalysisMode }> => {
      const userId = user?.id || 'anonymous';

      if (videoUri === 'sample') {
        // Always process sample videos locally
        const analysis = getMockAnalysis();
        addAnalysis(analysis);
        return { analysis, mode: 'offline' };
      }

      if (isOnline) {
        // Online: Add to queue and process immediately
        const queueItem = await addToQueue(videoUri, userId);

        // Wait for processing to complete (with timeout)
        const startTime = Date.now();
        const timeout = 60000; // 60 seconds

        while (Date.now() - startTime < timeout) {
          const currentItem = queueState.items.find((i) => i.id === queueItem.id);

          if (currentItem?.status === 'completed') {
            // Get the latest analysis from store
            const { analyses } = useAppStore.getState();
            const analysis = analyses[0]; // Most recent
            return { analysis, mode: 'online' };
          }

          if (currentItem?.status === 'failed') {
            throw new Error(currentItem.error || 'Analysis failed');
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Timeout - but video is still queued
        throw new Error('Analysis timed out. Your video is saved and will be processed when ready.');
      } else {
        // Offline: Queue for later and provide local analysis
        await addToQueue(videoUri, userId);

        // Generate a preliminary local analysis
        const localAnalysis = getMockAnalysis();
        localAnalysis.id = `local_${Date.now()}`;
        addAnalysis(localAnalysis);

        return { analysis: localAnalysis, mode: 'queued' };
      }
    },
    [isOnline, user, addAnalysis, queueState.items]
  );

  const retryUpload = useCallback(async (id: string) => {
    await retryQueueItem(id);
  }, []);

  const cancelUpload = useCallback(async (id: string) => {
    await removeFromQueue(id);
  }, []);

  const processQueuedItems = useCallback(async () => {
    await processQueue();
  }, []);

  const status = getQueueStatus();

  return {
    analyzeVideo,
    queueState,
    isOnline,
    pendingCount: status.pending + status.uploading,
    retryUpload,
    cancelUpload,
    processQueuedItems,
  };
};
