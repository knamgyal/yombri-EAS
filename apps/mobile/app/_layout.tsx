// apps/mobile/app/_layout.tsx
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ThemeProvider, useTheme } from "@yombri/native-runtime";
import { AppLockProvider } from "../src/security/AppLockProvider";
import { AppLockGate } from "../src/security/AppLockGate";
import { SessionProvider } from "../src/ctx/session";

import { enableScreens } from "react-native-screens";
enableScreens(false);

// Recommended at module scope so it runs before the first render.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { theme, isReady } = useTheme();

  // While ThemeProvider/useTheme initializes, keep a stable background.
  if (!isReady || !theme) {
    return <View style={{ flex: 1, backgroundColor: "#ffffff" }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary ?? "#ffffff",
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="create-event" options={{ title: "Create Event" }} />
      {__DEV__ && <Stack.Screen name="auth-test" options={{ title: "Auth Test" }} />}
      <Stack.Screen name="event/[eventId]" options={{ title: "Event" }} />
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
    if (fontsLoaded && themeReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, themeReady]);

  // Keep splash screen visible until both are ready.
  if (!fontsLoaded || !themeReady) return null;

  return (
    <AppLockProvider policy="optional">
      <AppLockGate>
        <SessionProvider>
          <RootStack />
        </SessionProvider>
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
