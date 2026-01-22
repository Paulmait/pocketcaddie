/**
 * Custom Video Slider Component
 *
 * A simple slider for video playback that doesn't rely on
 * @react-native-community/slider (which has new architecture issues)
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent,
} from 'react-native';
import { colors } from '../constants/theme';

interface VideoSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  onSlidingComplete: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: object;
}

export const VideoSlider: React.FC<VideoSliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  onSlidingComplete,
  minimumTrackTintColor = colors.primary.light,
  maximumTrackTintColor = colors.surface.glassBorder,
  thumbTintColor = colors.primary.light,
  style,
}) => {
  const [sliderWidth, setSliderWidth] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);

  // Update local value when prop changes (if not dragging)
  React.useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const calculateValue = useCallback(
    (locationX: number): number => {
      if (sliderWidth === 0) return minimumValue;
      const ratio = Math.max(0, Math.min(1, locationX / sliderWidth));
      return minimumValue + ratio * (maximumValue - minimumValue);
    },
    [sliderWidth, minimumValue, maximumValue]
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          setIsDragging(true);
          const newValue = calculateValue(evt.nativeEvent.locationX);
          setLocalValue(newValue);
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          const newValue = calculateValue(evt.nativeEvent.locationX);
          setLocalValue(newValue);
        },
        onPanResponderRelease: (evt: GestureResponderEvent) => {
          setIsDragging(false);
          const newValue = calculateValue(evt.nativeEvent.locationX);
          onSlidingComplete(newValue);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
        },
      }),
    [calculateValue, onSlidingComplete]
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const progress =
    maximumValue > minimumValue
      ? (localValue - minimumValue) / (maximumValue - minimumValue)
      : 0;

  return (
    <View
      style={[styles.container, style]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      {/* Track background */}
      <View
        style={[
          styles.track,
          { backgroundColor: maximumTrackTintColor },
        ]}
      />
      {/* Filled track */}
      <View
        style={[
          styles.filledTrack,
          {
            backgroundColor: minimumTrackTintColor,
            width: `${progress * 100}%`,
          },
        ]}
      />
      {/* Thumb */}
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbTintColor,
            left: `${progress * 100}%`,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  filledTrack: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
