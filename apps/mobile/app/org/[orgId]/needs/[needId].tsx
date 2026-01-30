import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";
import { supabase } from "@/lib/supabase";
import type { PledgeRow, PledgeStatus } from "@/api/v1/routes/pledges";

type NeedRow = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

export default function NeedDetailScreen() {
  const { theme } = useTheme();
  const { orgId, needId } = useLocalSearchParams<{ orgId: string; needId: string }>();

  const [need, setNeed] = useState<NeedRow | null>(null);
  const [pledges, setPledges] = useState<PledgeRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<"admin" | "staff" | null>(null);

  const isOrgManager = useMemo(() => myRole === "admin" || myRole === "staff", [myRole]);

  async function load() {
    setStatus(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMyUserId(uid);

      if (uid) {
        const { data: membership } = await supabase
          .from("org_members")
          .select("role")
          .eq("org_id", String(orgId))
          .eq("user_id", uid)
          .maybeSingle();

        setMyRole((membership?.role as any) ?? null);
      } else {
        setMyRole(null);
      }

      const { data: needRow, error: nErr } = await supabase
        .from("needs")
        .select("id, org_id, title, description, created_by, created_at")
        .eq("id", String(needId))
        .single();

      if (nErr) throw nErr;
      setNeed(needRow as NeedRow);

      const list = await api.v1.pledges.listForNeed(String(needId));
      setPledges(list);
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to load need.");
    }
  }

  useEffect(() => {
    void load();
  }, [orgId, needId]);

  async function createPledge() {
    setBusy(true);
    setStatus(null);
    try {
      await api.v1.pledges.createForNeed(String(needId));
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to create pledge (RLS?).");
    } finally {
      setBusy(false);
    }
  }

  async function setPledgeStatus(pledgeId: string, next: PledgeStatus) {
    setBusy(true);
    setStatus(null);
    try {
      await api.v1.pledges.setStatus(pledgeId, next);
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to update pledge (RLS?).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {status ? <Text style={{ color: theme.colors.text.secondary }}>{status}</Text> : null}

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
        <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>{need?.title ?? "Need"}</Text>
        {need?.description ? <Text style={{ color: theme.colors.text.secondary }}>{need.description}</Text> : null}
        <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
          role: {myRole ?? "(none)"} • need: {String(needId)}
        </Text>

        <Pressable
          onPress={createPledge}
          disabled={busy}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.primary, opacity: pressed || busy ? 0.75 : 1 },
          ]}
        >
          <Text style={{ fontWeight: "800", color: theme.colors.onPrimary ?? theme.colors.text.primary }}>
            Create pledge (as me)
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: theme.colors.text.primary }]}>Pledges</Text>

      <FlatList
        data={pledges}
        keyExtractor={(p) => p.id}
        refreshing={busy}
        onRefresh={load}
        contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isMine = !!myUserId && item.sponsor_id === myUserId;

          return (
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)" }]}>
              <Text style={{ fontWeight: "900", color: theme.colors.text.primary }}>
                {item.status.toUpperCase()}
              </Text>
              <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
                pledge: {item.id}
              </Text>
              <Text style={{ color: theme.colors.text.secondary, fontSize: 12 }}>
                sponsor: {item.sponsor_id}
              </Text>

              {isOrgManager ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => setPledgeStatus(item.id, "accepted")}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.smallButton,
                      { borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)", opacity: pressed || busy ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Accept</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setPledgeStatus(item.id, "rejected")}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.smallButton,
                      { borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)", opacity: pressed || busy ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Reject</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setPledgeStatus(item.id, "confirmed")}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.smallButton,
                      { borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)", opacity: pressed || busy ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Confirm</Text>
                  </Pressable>
                </View>
              ) : null}

              {isMine ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => setPledgeStatus(item.id, "delivered")}
                    disabled={busy}
                    style={({ pressed }) => [
                      styles.smallButton,
                      { borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)", opacity: pressed || busy ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={{ fontWeight: "800", color: theme.colors.text.primary }}>Mark delivered</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          !busy ? <Text style={{ color: theme.colors.text.secondary }}>No pledges yet.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  section: { marginTop: 6, fontSize: 16, fontWeight: "900" },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  smallButton: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" },
});
