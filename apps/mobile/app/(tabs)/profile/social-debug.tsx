// apps/mobile/app/(tabs)/profile/social-debug.tsx
import { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
import { Redirect } from "expo-router";
import { api } from "@/api/v1";

export default function SocialDebug() {
  if (!__DEV__) return <Redirect href="/(tabs)/profile" />;

  const [targetUserId, setTargetUserId] = useState("");
  const [log, setLog] = useState("Ready");
  const append = (msg: string) => setLog((p) => `${p}\n${msg}`);

  async function refreshStatus() {
    const id = targetUserId.trim();
    if (!id) return append("Enter target user_id first");

    append(`status for target=${id}`);
    try {
      const followRow = await api.v1.follows.myFollowRow(id);
      const mutual = await api.v1.follows.isMutualFollow(id);
      const canDm = await api.v1.follows.canDm(id);

      append(`following: ${followRow ? `yes (row=${followRow.id})` : "no"}`);
      append(`mutual: ${mutual ? "yes" : "no"}`);
      append(`can_dm: ${canDm ? "yes" : "no"}`);
    } catch (e: any) {
      append(`error: ${e?.message ?? "unknown"}`);
    }
  }

  async function follow() {
    const id = targetUserId.trim();
    if (!id) return append("Enter target user_id first");
    append("follow");
    try {
      const row = await api.v1.follows.follow(id);
      append(`follow ok: ${row.id}`);
      await refreshStatus();
    } catch (e: any) {
      append(`follow error: ${e?.message ?? "unknown"}`);
    }
  }

  async function unfollow() {
    const id = targetUserId.trim();
    if (!id) return append("Enter target user_id first");
    append("unfollow");
    try {
      await api.v1.follows.unfollowByUserId(id);
      append("unfollow ok");
      await refreshStatus();
    } catch (e: any) {
      append(`unfollow error: ${e?.message ?? "unknown"}`);
    }
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 18 }}>Social debug (dev-only)</Text>

      <TextInput
        placeholder="Target user_id (uuid)"
        value={targetUserId}
        onChangeText={setTargetUserId}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
      />

      <Button title="Refresh status" onPress={refreshStatus} />
      <Button title="Follow" onPress={follow} />
      <Button title="Unfollow" onPress={unfollow} />

      <Text selectable style={{ marginTop: 12 }}>
        {log}
      </Text>
    </View>
  );
}
