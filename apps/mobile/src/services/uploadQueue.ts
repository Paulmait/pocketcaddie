/**
 * Upload Queue Service
 * Manages offline-first video upload queue with persistence
 * Videos are queued locally and uploaded when connectivity returns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { checkNetworkStatus } from './network';
import { analyzeSwing } from './analysis';

const QUEUE_STORAGE_KEY = '@slicefix_upload_queue';
const LOCAL_VIDEOS_DIR = `${FileSystem.documentDirectory}pending_videos/`;

export interface QueuedUpload {
  id: string;
  localVideoPath: string;
  originalUri: string;
  userId: string;
  createdAt: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
}

export interface QueueState {
  items: QueuedUpload[];
  isProcessing: boolean;
}

const queueState: QueueState = {
  items: [],
  isProcessing: false,
};

let queueListeners: ((state: QueueState) => void)[] = [];

const notifyListeners = () => {
  queueListeners.forEach((listener) => listener({ ...queueState }));
};

export const subscribeToQueue = (listener: (state: QueueState) => void): (() => void) => {
  queueListeners.push(listener);
  listener({ ...queueState });
  return () => {
    queueListeners = queueListeners.filter((l) => l !== listener);
  };
};

const ensureLocalDir = async (): Promise<void> => {
  const dirInfo = await FileSystem.getInfoAsync(LOCAL_VIDEOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(LOCAL_VIDEOS_DIR, { intermediates: true });
  }
};

const saveQueueToStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queueState.items));
  } catch (error) {
    console.error('Failed to save queue to storage:', error);
  }
};

export const loadQueueFromStorage = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      queueState.items = JSON.parse(stored);
      notifyListeners();
    }
  } catch (error) {
    console.error('Failed to load queue from storage:', error);
  }
};

/**
 * Add a video to the upload queue
 * Copies the video to local storage for offline persistence
 */
export const addToQueue = async (
  videoUri: string,
  userId: string
): Promise<QueuedUpload> => {
  await ensureLocalDir();

  const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const localVideoPath = `${LOCAL_VIDEOS_DIR}${id}.mp4`;

  // Copy video to local storage for persistence
  await FileSystem.copyAsync({
    from: videoUri,
    to: localVideoPath,
  });

  const queueItem: QueuedUpload = {
    id,
    localVideoPath,
    originalUri: videoUri,
    userId,
    createdAt: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  queueState.items.unshift(queueItem);
  await saveQueueToStorage();
  notifyListeners();

  // Try to process immediately if online
  processQueue();

  return queueItem;
};

/**
 * Process the upload queue
 * Uploads pending videos when connectivity is available
 */
export const processQueue = async (): Promise<void> => {
  if (queueState.isProcessing) return;

  const pendingItems = queueState.items.filter(
    (item) => item.status === 'pending' || item.status === 'failed'
  );

  if (pendingItems.length === 0) return;

  const isOnline = await checkNetworkStatus();
  if (!isOnline) {
    console.log('Offline - queue processing deferred');
    return;
  }

  queueState.isProcessing = true;
  notifyListeners();

  for (const item of pendingItems) {
    if (item.retryCount >= 3) continue;

    try {
      // Update status to uploading
      updateQueueItem(item.id, { status: 'uploading' });

      // Check if local file still exists
      const fileInfo = await FileSystem.getInfoAsync(item.localVideoPath);
      if (!fileInfo.exists) {
        updateQueueItem(item.id, { status: 'failed', error: 'Local video not found' });
        continue;
      }

      // Perform analysis
      updateQueueItem(item.id, { status: 'analyzing' });

      await analyzeSwing({
        videoUri: item.localVideoPath,
        userId: item.userId,
      });

      // Mark as completed
      updateQueueItem(item.id, { status: 'completed' });

      // Clean up local video
      await FileSystem.deleteAsync(item.localVideoPath, { idempotent: true });
    } catch (error: any) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      updateQueueItem(item.id, {
        status: 'failed',
        error: error.message || 'Unknown error',
        retryCount: item.retryCount + 1,
      });
    }
  }

  queueState.isProcessing = false;
  await saveQueueToStorage();
  notifyListeners();
};

const updateQueueItem = (id: string, updates: Partial<QueuedUpload>): void => {
  queueState.items = queueState.items.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  notifyListeners();
};

export const removeFromQueue = async (id: string): Promise<void> => {
  const item = queueState.items.find((i) => i.id === id);
  if (item) {
    // Clean up local video
    await FileSystem.deleteAsync(item.localVideoPath, { idempotent: true });
  }

  queueState.items = queueState.items.filter((i) => i.id !== id);
  await saveQueueToStorage();
  notifyListeners();
};

export const retryQueueItem = async (id: string): Promise<void> => {
  updateQueueItem(id, { status: 'pending', retryCount: 0, error: undefined });
  await saveQueueToStorage();
  processQueue();
};

export const getQueueStatus = (): {
  pending: number;
  uploading: number;
  failed: number;
  completed: number;
} => {
  return {
    pending: queueState.items.filter((i) => i.status === 'pending').length,
    uploading: queueState.items.filter((i) => i.status === 'uploading' || i.status === 'analyzing').length,
    failed: queueState.items.filter((i) => i.status === 'failed').length,
    completed: queueState.items.filter((i) => i.status === 'completed').length,
  };
};

export const clearCompletedItems = async (): Promise<void> => {
  queueState.items = queueState.items.filter((i) => i.status !== 'completed');
  await saveQueueToStorage();
  notifyListeners();
};
