import React, { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/api/v1";
import { useTheme } from "@yombri/native-runtime";
import { AvatarPathImage } from "@/components/AvatarPathImage";

type Row = { user_id: string; display_name: string | null; avatar_path: string | null };

export default function FollowersScreen() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRows(await api.v1.follows.listFollowers());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load followers");
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {error ? <Text style={{ padding: 16, color: "crimson" }}>{error}</Text> : null}

      <FlatList
        data={rows}
        keyExtractor={(r) => r.user_id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        onRefresh={load}
        refreshing={loading}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/profile/user/${item.user_id}`)}
            style={({ pressed }) => ({
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
              backgroundColor: theme.colors.surface,
              opacity: pressed ? 0.7 : 1,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
            })}
          >
            <AvatarPathImage avatarPath={item.avatar_path} size={44} ttlSeconds={60} />

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontWeight: "700", color: theme.colors.text.primary }}>
                {item.display_name ?? item.user_id}
              </Text>
              <Text style={{ color: theme.colors.text.secondary }} selectable>
                {item.user_id}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
