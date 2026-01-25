import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@yombri/native-runtime';
import { TabBarBackground } from '../../components/TabBarBackground';

export default function TabsLayout() {
<<<<<<< Updated upstream
  const { theme } = useTheme();
=======
  const { theme, isReady } = useTheme();
  const { session, isLoading } = useSession();

  const isAppLoading = !isReady || !theme || isLoading;
  const shouldRedirect = !isAppLoading && !session;

  if (isAppLoading) return <Text>Loading...</Text>;
  if (shouldRedirect) return <Redirect href="/(auth)/sign-in" />;
>>>>>>> Stashed changes

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
