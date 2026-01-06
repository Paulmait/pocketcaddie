/**
 * Network Status Component
 * Displays current network status and pending uploads indicator
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../services/network';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface NetworkStatusProps {
  pendingCount?: number;
  onPress?: () => void;
  showAlways?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  pendingCount = 0,
  onPress,
  showAlways = false,
}) => {
  const { isConnected, isInternetReachable } = useNetworkStore();

  const isOnline = isConnected && isInternetReachable !== false;
  const showOffline = !isOnline;
  const showPending = pendingCount > 0;

  if (!showOffline && !showPending && !showAlways) {
    return null;
  }

  const content = (
    <View style={[styles.container, showOffline && styles.offlineContainer]}>
      <View style={styles.statusDot}>
        <Ionicons
          name={showOffline ? 'cloud-offline' : pendingCount > 0 ? 'cloud-upload' : 'cloud-done'}
          size={16}
          color={showOffline ? colors.status.error : pendingCount > 0 ? colors.secondary.main : colors.status.success}
        />
      </View>
      <Text style={styles.statusText}>
        {showOffline
          ? 'Offline - Videos queued'
          : pendingCount > 0
          ? `${pendingCount} pending upload${pendingCount > 1 ? 's' : ''}`
          : 'Connected'}
      </Text>
      {showPending && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingCount}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

interface OfflineBannerProps {
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = 'You\'re offline. Videos will be analyzed when connected.',
}) => {
  const { isConnected, isInternetReachable } = useNetworkStore();
  const isOnline = isConnected && isInternetReachable !== false;

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={18} color={colors.text.primary} />
      <Text style={styles.bannerText}>{message}</Text>
    </View>
  );
};

interface ProcessingModeIndicatorProps {
  mode: 'online' | 'offline' | 'queued';
}

export const ProcessingModeIndicator: React.FC<ProcessingModeIndicatorProps> = ({ mode }) => {
  const config = {
    online: {
      icon: 'cloud-upload' as const,
      text: 'Analyzing in cloud...',
      color: colors.primary.light,
    },
    offline: {
      icon: 'phone-portrait' as const,
      text: 'Analyzing locally...',
      color: colors.secondary.main,
    },
    queued: {
      icon: 'time' as const,
      text: 'Queued for upload',
      color: colors.status.warning,
    },
  };

  const { icon, text, color } = config[mode];

  return (
    <View style={styles.modeIndicator}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.modeText, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  offlineContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusDot: {
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  badge: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.background.primary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bannerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  modeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
});
