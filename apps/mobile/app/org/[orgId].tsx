import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";

type OrgRow = {
  id: string;
  name: string;
  mission: string | null;
  verified: boolean;
  created_at: string;
};

export default function OrgDashboardScreen() {
  const { theme } = useTheme();
  const { orgId } = useLocalSearchParams<{ orgId: string }>();

  const [org, setOrg] = useState<OrgRow | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setStatus(null);

        const orgRow = await api.v1.orgs.getOrgById(String(orgId));
        setOrg(orgRow);
      } catch (e: any) {
        setOrg(null);
        setStatus(e?.message ?? "Failed to load org.");
      }
    })();
  }, [orgId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Pressable
        onPress={() => router.push("/orgs")}
        style={({ pressed }) => [
          styles.smallButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Back to orgs</Text>
      </Pressable>

      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {org?.name ?? "Organization"}
      </Text>

      {org?.mission ? <Text style={{ color: theme.colors.text.secondary }}>{org.mission}</Text> : null}

      {status ? <Text style={{ color: theme.colors.text.secondary }}>{status}</Text> : null}

      <Pressable
        onPress={() => router.push(`/org/${String(orgId)}/needs`)}
        style={({ pressed }) => [
          styles.cardButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Needs</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Create and manage org needs.</Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Events</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Skeleton: list/create events for this org.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Pledges</Text>
        <Text style={{ color: theme.colors.text.secondary }}>Skeleton: accept/reject pledges (unlocks chat later).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardButton: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  smallButton: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignSelf: "flex-start" },
});
