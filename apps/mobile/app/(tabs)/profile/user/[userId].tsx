import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button } from "react-native";
import { useLocalSearchParams, Redirect } from "expo-router";
import { api } from "@/api/v1";
import { useTheme } from "@yombri/native-runtime";
import { AvatarPathImage } from "@/components/AvatarPathImage";

type VisibleProfile = {
  user_id: string;
  display_name: string | null;
  avatar_path: string | null;
};

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ userId: string }>();
  const userId = useMemo(() => String(params.userId ?? "").trim(), [params.userId]);

  const [log, setLog] = useState("Ready");
  const append = (msg: string) => setLog((p) => `${p}\n${msg}`);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<VisibleProfile | null>(null);

  if (!userId) return <Redirect href="/profile" />;

  async function refresh() {
    setLoading(true);
    try {
      const p = await api.v1.profiles.getByUserId(userId);
      setProfile(p as any);

      append(`profile: ${p ? "visible" : "not visible (RLS?)"}`);

      const followRow = await api.v1.follows.myFollowRow(userId);
      const mutual = await api.v1.follows.isMutualFollow(userId);
      const canDm = await api.v1.follows.canDm(userId);

      append(`following: ${followRow ? `yes (row=${followRow.id})` : "no"}`);
      append(`mutual: ${mutual ? "yes" : "no"}`);
      append(`can_dm: ${canDm ? "yes" : "no"}`);
    } catch (e: any) {
      append(`error: ${e?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  async function follow() {
    setLoading(true);
    try {
      const row = await api.v1.follows.follow(userId);
      append(`follow ok: ${row.id}`);
      await refresh();
    } catch (e: any) {
      append(`follow error: ${e?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  async function unfollow() {
    setLoading(true);
    try {
      await api.v1.follows.unfollowByUserId(userId);
      append("unfollow ok");
      await refresh();
    } catch (e: any) {
      append(`unfollow error: ${e?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  async function block() {
    setLoading(true);
    try {
      await api.v1.blocks.block(userId);
      append("block ok");
      await refresh();
    } catch (e: any) {
      append(`block error: ${e?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  async function unblock() {
    setLoading(true);
    try {
      await api.v1.blocks.unblockByUserId(userId);
      append("unblock ok");
      await refresh();
    } catch (e: any) {
      append(`unblock error: ${e?.message ?? "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLog("Ready");
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text.primary }}>User</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <AvatarPathImage avatarPath={profile?.avatar_path ?? null} size={56} ttlSeconds={60} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: theme.colors.text.primary, fontWeight: "700" }}>
            {profile?.display_name ?? "(no display name or not visible)"}
          </Text>
          <Text style={{ color: theme.colors.text.secondary }} selectable>
            {userId}
          </Text>
        </View>
      </View>

      <Button title="Refresh" onPress={refresh} disabled={loading} />
      <Button title="Follow" onPress={follow} disabled={loading} />
      <Button title="Unfollow" onPress={unfollow} disabled={loading} />
      <Button title="Block" onPress={block} disabled={loading} />
      <Button title="Unblock" onPress={unblock} disabled={loading} />

      <Text selectable style={{ marginTop: 12, color: theme.colors.text.primary }}>
        {log}
      </Text>
    </View>
  );
}
