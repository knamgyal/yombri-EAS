import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from '@yombri/native-runtime';
import { AppLockProvider } from '../src/security/AppLockProvider';
import { AppLockGate } from '../src/security/AppLockGate';

import { enableScreens } from 'react-native-screens';
enableScreens(false);

// Recommended to call in module scope (can be "too late" if inside hooks)
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { theme, isReady } = useTheme();

  // ThemeProvider returns null until ready; keep a safe background here too.
  if (!isReady || !theme) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary ?? '#ffffff',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-event" options={{ title: 'Create Event' }} />
      <Stack.Screen name="event/[eventId]" options={{ title: 'Event' }} />
    </Stack>
  );
}

function AppBootstrap() {
  const [fontsLoaded, fontsError] = useFonts({});
  const { isReady: themeReady } = useTheme();

  useEffect(() => {
    if (fontsError) throw fontsError;
  }, [fontsError]);

  useEffect(() => {
    // Hide splash only when BOTH are ready, otherwise you can get a blank screen
    // because ThemeProvider gates rendering until isReady.
    if (fontsLoaded && themeReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, themeReady]);

  // While loading, keep the splash screen visible; returning null is a common pattern.
  // (You can also return a white View if you prefer.)
  if (!fontsLoaded || !themeReady) return null;

  return (
    <AppLockProvider policy="optional">
      <AppLockGate>
        <RootStack />
      </AppLockGate>
    </AppLockProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppBootstrap />
    </ThemeProvider>
  );
}
