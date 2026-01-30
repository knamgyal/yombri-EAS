// apps/mobile/app/_layout.tsx
import { useEffect, useMemo } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ThemeProvider, useTheme } from "@yombri/native-runtime";
import { AppLockProvider } from "../src/security/AppLockProvider";
import { AppLockGate } from "../src/security/AppLockGate";
import { SessionProvider } from "../src/ctx/session";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { theme, isReady } = useTheme();

  const screenOptions = useMemo(() => {
    // Always return options; fall back until theme is ready.
    const primary = theme?.colors?.primary ?? "#111827";
    const onPrimary = theme?.colors?.onPrimary ?? "#ffffff";
    const background = theme?.colors?.background ?? "#ffffff";

    return {
      headerStyle: { backgroundColor: primary },
      headerTintColor: onPrimary,
      contentStyle: { backgroundColor: background },
    };
  }, [theme]);

  return (
    <Stack screenOptions={screenOptions}>
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
