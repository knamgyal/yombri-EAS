import React from "react";
import { Stack } from "expo-router";

export default function OrgsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Organizations" }} />
    </Stack>
  );
}
