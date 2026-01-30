import React from "react";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function FeedLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Feed" }} />
    </Stack>
  );
}
