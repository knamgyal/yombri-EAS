// apps/mobile/components/TabBarBackground.tsx
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@yombri/native-runtime';

export function TabBarBackground() {
  const { isDark } = useTheme();

  // Android: stable translucent fallback (no experimental blur).
  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? '#00000080' : '#ffffffcc' },
        ]}
      />
    );
  }

  // iOS: real blur.
  return (
    <BlurView
      tint={isDark ? 'dark' : 'light'}
      intensity={60}
      style={StyleSheet.absoluteFill}
    />
  );
}
