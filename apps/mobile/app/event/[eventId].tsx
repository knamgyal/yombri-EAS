import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";

import { useTheme } from "@yombri/native-runtime";
import { supabase } from "@/lib/supabase";

type EventRow = {
  id: string;
  title?: string | null;
  description?: string | null;
  starts_at?: string | null;
  created_at?: string | null;
};

export default function EventDetailScreen() {
  const { theme } = useTheme();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const id = String(eventId ?? "").trim();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [event, setEvent] = useState<EventRow | null>(null);

  async function load() {
    if (!id) {
      setStatus("Missing eventId.");
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Assumes a table named `events` exists. If not, this will show an error message.
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, starts_at, created_at")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setStatus("Event not found.");
        setEvent(null);
        return;
      }

      setEvent(data as EventRow);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to load event.");
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: "Event" }} />

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {event?.title ?? (loading ? "Loading…" : "Event")}
      </Text>

      {status ? (
        <Text style={[styles.status, { color: theme.colors.text.secondary }]}>{status}</Text>
      ) : null}

      {event?.description ? (
        <Text style={[styles.body, { color: theme.colors.text.primary }]}>{event.description}</Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onPrimary ?? "#fff" }]}>
            Back
          </Text>
        </Pressable>

        <Pressable
          onPress={load}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.primary,
              opacity: pressed || loading ? 0.75 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onPrimary ?? "#fff" }]}>
            {loading ? "Refreshing…" : "Refresh"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  status: { fontSize: 14 },
  body: { fontSize: 16, lineHeight: 22 },
  actions: { marginTop: 12, gap: 10 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  buttonText: { fontSize: 16, fontWeight: "700" },
});
