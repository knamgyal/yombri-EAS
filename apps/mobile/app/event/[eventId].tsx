// apps/mobile/app/event/[eventId].tsx
import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function EventAliasRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const id = String(eventId ?? "").trim();

  // If someone deep-links to /event/:id, send them to the canonical Feed detail route.
  if (!id) return <Redirect href="/(tabs)/home" />;

  return <Redirect href={`/feed/${id}`} />;
}
