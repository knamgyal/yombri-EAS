import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";
import { supabase } from "@/lib/supabase";

export default function SocialDebugScreen() {
  const { theme } = useTheme();

  // Existing debug inputs
  const [targetUserId, setTargetUserId] = useState("");
  const trimmedTargetUserId = useMemo(() => targetUserId.trim(), [targetUserId]);

  const [status, setStatus] = useState<string | null>(null);

  // Org debug inputs
  const [orgName, setOrgName] = useState("");
  const [orgMission, setOrgMission] = useState("");
  const [myOrgsText, setMyOrgsText] = useState<string>("(not loaded)");

  async function runSocialChecks() {
    const id = trimmedTargetUserId;
    if (!id) {
      setStatus("Enter a target user id.");
      return;
    }

    setStatus("Checking…");
    try {
      const followRow = await api.v1.follows.myFollowRow(id);
      const isMutual = await api.v1.follows.isMutualFollow(id);
      const canDm = await api.v1.follows.canDm(id);

      setStatus(
        [
          `myFollowRow: ${followRow ? "YES" : "NO"}`,
          `isMutualFollow: ${isMutual ? "YES" : "NO"}`,
          `canDm: ${canDm ? "YES" : "NO"}`,
        ].join("\n")
      );
    } catch (e: any) {
      setStatus(e?.message ?? "Failed social checks.");
    }
  }

  async function loadMyOrgs() {
    setStatus(null);
    try {
      const orgs = await api.v1.orgs.listMyOrgs();
      setMyOrgsText(
        orgs.length
          ? orgs.map((o) => `${o.name} (${o.id})`).join("\n")
          : "(none)"
      );
    } catch (e: any) {
      setMyOrgsText("(error)");
      setStatus(e?.message ?? "Failed to load orgs.");
    }
  }

  async function createOrg() {
    const name = orgName.trim();
    if (!name) {
      setStatus("Org name is required.");
      return;
    }

    setStatus("Creating org…");
    try {
      const org = await api.v1.orgs.createOrg({
        name,
        mission: orgMission.trim() || null,
        location_radius_km: null,
      });

      setOrgName("");
      setOrgMission("");

      setStatus(`Created org: ${org.name} (${org.id})`);
      await loadMyOrgs();

      // Jump directly into the org dashboard route
      router.push(`/org/${org.id}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to create org.");
    }
  }

  useEffect(() => {
    void loadMyOrgs();
  }, []);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>

    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
  <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Auth (dev)</Text>

  <Pressable
    onPress={async () => {
      await supabase.auth.signOut();
      // Your tab auth gate should redirect, but this makes it immediate
      router.replace("/auth/sign-in");
    }}
    style={({ pressed }) => [
      styles.buttonSecondary,
      { borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)", opacity: pressed ? 0.8 : 1 },
    ]}
  >
    <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Sign out</Text>
  </Pressable>

  <Pressable
    onPress={() => router.push("/auth/sign-in")}
    style={({ pressed }) => [
      styles.buttonSecondary,
      { borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)", opacity: pressed ? 0.8 : 1 },
    ]}
  >
    <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Go to sign-in</Text>
  </Pressable>
</View>


      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Social debug (dev)</Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Follow / mutual / DM checks</Text>

        <TextInput
          value={targetUserId}
          onChangeText={setTargetUserId}
          placeholder="Target user UUID"
          placeholderTextColor={theme.colors.text.secondary}
          autoCapitalize="none"
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <Pressable
          onPress={runSocialChecks}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={{ fontWeight: "800", color: theme.colors.onPrimary ?? theme.colors.text.primary }}>
            Run checks
          </Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>Organizations (dev)</Text>

        <TextInput
          value={orgName}
          onChangeText={setOrgName}
          placeholder="Org name"
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <TextInput
          value={orgMission}
          onChangeText={setOrgMission}
          placeholder="Mission (optional)"
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            { color: theme.colors.text.primary, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" },
          ]}
        />

        <Pressable
          onPress={createOrg}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={{ fontWeight: "800", color: theme.colors.onPrimary ?? theme.colors.text.primary }}>
            Create org
          </Text>
        </Pressable>

        <Pressable
          onPress={loadMyOrgs}
          style={({ pressed }) => [
            styles.buttonSecondary,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>
            Refresh my orgs
          </Text>
        </Pressable>

        <Text style={{ color: theme.colors.text.secondary, lineHeight: 18 }}>
          {myOrgsText}
        </Text>
      </View>

      {status ? (
        <Text style={[styles.status, { color: theme.colors.text.secondary }]} selectable>
          {status}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "900" },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  buttonSecondary: { paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  status: { marginTop: 2 },
});
