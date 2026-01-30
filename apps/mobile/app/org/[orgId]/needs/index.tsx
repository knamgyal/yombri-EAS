// apps/mobile/app/org/[orgId]/needs/index.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, TextInput } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";

type NeedRow = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

export default function OrgNeedsScreen() {
  const { theme } = useTheme();
  const { orgId } = useLocalSearchParams<{ orgId: string }>();

  const [rows, setRows] = useState<NeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      const data = await api.v1.needs.listByOrg(String(orgId));
      setRows(data);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to load needs.");
    } finally {
      setLoading(false);
    }
  }

  async function createNeed() {
    const t = title.trim();
    if (!t) {
      setStatus("Title is required.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await api.v1.needs.create({
        orgId: String(orgId),
        title: t,
        description: description.trim() || null,
      });

      setTitle("");
      setDescription("");
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to create need.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [orgId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {status ? <Text style={{ color: theme.colors.text.secondary }}>{status}</Text> : null}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
        ]}
      >
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Create need</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <Pressable
          onPress={createNeed}
          disabled={loading}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.primary, opacity: pressed || loading ? 0.75 : 1 },
          ]}
        >
          <Text style={{ fontWeight: "800", color: theme.colors.onPrimary ?? theme.colors.text.primary }}>
            {loading ? "Working..." : "Create"}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: theme.colors.text.primary }]}>Needs</Text>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/org/${String(orgId)}/needs/${item.id}`)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>{item.title}</Text>
            {item.description ? <Text style={{ color: theme.colors.text.secondary }}>{item.description}</Text> : null}
            <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>{item.id}</Text>
            <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
              Tap to view pledges →
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? <Text style={{ color: theme.colors.text.secondary }}>No needs yet.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  section: { marginTop: 6, fontSize: 16, fontWeight: "900" },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
});
