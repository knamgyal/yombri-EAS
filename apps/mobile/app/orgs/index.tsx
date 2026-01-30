import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";

type OrgRow = {
  id: string;
  name: string;
  mission: string | null;
  verified: boolean;
  created_at: string;
};

export default function OrgsIndexScreen() {
  const { theme } = useTheme();

  const [rows, setRows] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [mission, setMission] = useState("");

  async function load() {
    setLoading(true);
    setStatus(null);
    try {
      // Discoverable orgs list (sponsors can browse)
      setRows(await api.v1.orgs.listOrgs());
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createOrg() {
    const trimmed = name.trim();
    if (!trimmed) {
      setStatus("Name is required.");
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const org = await api.v1.orgs.createOrg({
        name: trimmed,
        mission: mission.trim() || null,
        location_radius_km: null,
      });

      setName("");
      setMission("");
      await load();

      // Correct route: /org/[orgId]
      if (!org?.id) {
        setStatus("Org created, but missing org.id (cannot navigate).");
        return;
      }

      router.push({ pathname: "/org/[orgId]", params: { orgId: org.id } });
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to create org.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Organizations</Text>

      {status ? <Text style={{ color: theme.colors.text.secondary }}>{status}</Text> : null}

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
          },
        ]}
      >
        <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Create org</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Org name"
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <TextInput
          value={mission}
          onChangeText={setMission}
          placeholder="Mission (optional)"
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <Pressable
          onPress={createOrg}
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

      <Text style={[styles.section, { color: theme.colors.text.primary }]}>Browse orgs</Text>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/org/[orgId]", params: { orgId: item.id } })}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>{item.name}</Text>
            <Text style={{ color: theme.colors.text.secondary }}>
              {item.mission ?? (item.verified ? "Verified org" : "Unverified org")}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? <Text style={{ color: theme.colors.text.secondary }}>No orgs found.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  section: { marginTop: 6, fontSize: 16, fontWeight: "900" },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
});
