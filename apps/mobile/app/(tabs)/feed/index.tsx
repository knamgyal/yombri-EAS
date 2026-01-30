import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";

type Row = {
  id: string;
  title: string | null;
  created_at: string | null;
};

export default function FeedIndexScreen() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.v1.events.listLatest(50);
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {loading && rows.length === 0 ? (
        <Text style={{ padding: 16, color: theme.colors.text.secondary }}>Loading…</Text>
      ) : null}

      {error ? <Text style={{ padding: 16, color: "crimson" }}>{error}</Text> : null}

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onRefresh={load}
        refreshing={loading}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/event/${String(item.id)}`)}
            style={({ pressed }) => ({
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
              backgroundColor: theme.colors.surface,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>
              {item.title ?? "Untitled event"}
            </Text>
            <Text style={{ color: theme.colors.text.secondary }}>id: {item.id}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ padding: 16, color: theme.colors.text.secondary }}>
              No events yet.
            </Text>
          ) : null
        }
      />
    </View>
  );
}
