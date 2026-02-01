import React from "react";
import { Platform, Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { useSession } from "../../src/ctx/session";
import { TabBarBackground } from "../../components/TabBarBackground";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabsLayout() {
  const { theme, isReady } = useTheme();
  const { session, loading } = useSession(); //updated to fix. apps/mobile/app/(tabs)/_layout.tsx reads isLoading from useSession(), but the session context exposes loading

  const isAppLoading = !isReady || !theme || loading; //updated

  const shouldRedirect = !isAppLoading && !session;

  if (isAppLoading) return <Text>Loading...</Text>;
  if (shouldRedirect) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary ?? "#ffffff",
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarShowLabel: false,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bolt" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-events"
        options={{
          title: "My Events",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size ?? 24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size ?? 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
