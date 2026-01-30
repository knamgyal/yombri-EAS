import React from "react";
import { Stack } from "expo-router";

export default function OrgLayout() {
  return (
    <Stack>
      <Stack.Screen name="[orgId]" options={{ title: "Org dashboard" }} />
      <Stack.Screen name="[orgId]/needs/index" options={{ title: "Needs" }} />
      <Stack.Screen name="[orgId]/needs/[needId]" options={{ title: "Need" }} />
    </Stack>
  );
}
