/**
 * Countdown Hook with Audio
 * Provides countdown functionality with audio feedback for recording
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Vibration } from 'react-native';

interface UseCountdownOptions {
  duration?: number; // Countdown duration in seconds
  onComplete?: () => void;
  enableVibration?: boolean;
  enableAudio?: boolean;
}

interface UseCountdownReturn {
  count: number | null;
  isCountingDown: boolean;
  startCountdown: () => void;
  cancelCountdown: () => void;
}

export const useCountdown = (options: UseCountdownOptions = {}): UseCountdownReturn => {
  const {
    duration = 3,
    onComplete,
    enableVibration = true,
    enableAudio = true,
  } = options;

  const [count, setCount] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const playBeep = useCallback(async (isFinal: boolean = false) => {
    if (!enableAudio) return;

    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Create a simple beep using Audio API
      // In production, you'd use actual sound files
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Use system sound for now (haptic feedback as fallback)
      if (enableVibration) {
        Vibration.vibrate(isFinal ? [0, 100, 50, 100] : 50);
      }
    } catch (error) {
      console.warn('Failed to play countdown sound:', error);
    }
  }, [enableAudio, enableVibration]);

  const startCountdown = useCallback(() => {
    if (isCountingDown) return;

    setIsCountingDown(true);
    setCount(duration);

    // Initial beep
    playBeep();

    timerRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev === null || prev <= 1) {
          // Countdown complete
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsCountingDown(false);

          // Final beep (different pattern)
          playBeep(true);

          // Call completion handler
          setTimeout(() => {
            onComplete?.();
            setCount(null);
          }, 100);

          return 0;
        }

        // Regular countdown beep
        playBeep();
        return prev - 1;
      });
    }, 1000);
  }, [duration, isCountingDown, onComplete, playBeep]);

  const cancelCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCountingDown(false);
    setCount(null);
  }, []);

  return {
    count,
    isCountingDown,
    startCountdown,
    cancelCountdown,
  };
};
