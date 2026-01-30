import React from "react";
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="followers" options={{ title: "Followers" }} />
      <Stack.Screen name="following" options={{ title: "Following" }} />
      <Stack.Screen name="blocked" options={{ title: "Blocked users" }} />
      <Stack.Screen name="user/[userId]" options={{ title: "User" }} />
      {__DEV__ && (
        <Stack.Screen name="social-debug" options={{ title: "Social debug (dev)" }} />
      )}
    </Stack>
  );
}
