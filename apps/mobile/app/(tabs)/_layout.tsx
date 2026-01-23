import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@yombri/native-runtime';
import { TabBarBackground } from '../../components/TabBarBackground';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary ?? '#ffffff',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarShowLabel: false,

        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' }, // recommended when using BlurView behind the tab bar
          default: {},
        }),
      }}
    >
      {/* Screens unchanged */}
    </Tabs>
  );
}
