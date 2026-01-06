/**
 * Shake Detector Hook
 * Detects device shake gestures for re-recording functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import { Vibration } from 'react-native';

interface UseShakeDetectorOptions {
  threshold?: number; // Acceleration threshold for shake detection
  debounceMs?: number; // Debounce time between shake detections
  onShake?: () => void;
  enabled?: boolean;
}

interface UseShakeDetectorReturn {
  isShaking: boolean;
  shakeCount: number;
  resetShakeCount: () => void;
}

const SHAKE_THRESHOLD = 1.8; // g-force threshold
const SHAKE_DEBOUNCE = 1000; // ms between shake detections
const UPDATE_INTERVAL = 100; // ms between accelerometer updates

export const useShakeDetector = (
  options: UseShakeDetectorOptions = {}
): UseShakeDetectorReturn => {
  const {
    threshold = SHAKE_THRESHOLD,
    debounceMs = SHAKE_DEBOUNCE,
    onShake,
    enabled = true,
  } = options;

  const [isShaking, setIsShaking] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  const lastShakeTime = useRef<number>(0);
  const lastAcceleration = useRef<AccelerometerMeasurement>({ x: 0, y: 0, z: 0 });

  const resetShakeCount = useCallback(() => {
    setShakeCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let subscription: { remove: () => void } | null = null;

    const setupAccelerometer = async () => {
      try {
        const isAvailable = await Accelerometer.isAvailableAsync();
        if (!isAvailable) {
          console.warn('Accelerometer not available');
          return;
        }

        // Set update interval
        Accelerometer.setUpdateInterval(UPDATE_INTERVAL);

        subscription = Accelerometer.addListener((data: AccelerometerMeasurement) => {
          const { x, y, z } = data;
          const lastX = lastAcceleration.current.x;
          const lastY = lastAcceleration.current.y;
          const lastZ = lastAcceleration.current.z;

          // Calculate acceleration delta
          const deltaX = Math.abs(x - lastX);
          const deltaY = Math.abs(y - lastY);
          const deltaZ = Math.abs(z - lastZ);

          // Calculate total acceleration change
          const acceleration = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

          // Update last acceleration
          lastAcceleration.current = { x, y, z };

          // Check for shake
          const now = Date.now();
          if (acceleration > threshold && now - lastShakeTime.current > debounceMs) {
            lastShakeTime.current = now;

            setIsShaking(true);
            setShakeCount((prev) => prev + 1);

            // Haptic feedback
            Vibration.vibrate(100);

            // Call callback
            onShake?.();

            // Reset shaking state after a short delay
            setTimeout(() => {
              setIsShaking(false);
            }, 300);
          }
        });
      } catch (error) {
        console.error('Failed to setup accelerometer:', error);
      }
    };

    setupAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [enabled, threshold, debounceMs, onShake]);

  return {
    isShaking,
    shakeCount,
    resetShakeCount,
  };
};
