import { supabase } from "@/lib/supabase";

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("No authed user");
  return data.user.id;
}

type UserListRow = {
  user_id: string;
  display_name: string | null;
  avatar_path: string | null;
};

export const follows = {
  async follow(targetUserId: string) {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from("follows")
      .insert({ follower_id: userId, following_id: targetUserId })
      .select("id, follower_id, following_id, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async unfollowById(followId: string) {
    const { error } = await supabase.from("follows").delete().eq("id", followId);
    if (error) throw error;
    return { ok: true as const };
  },

  async unfollowByUserId(targetUserId: string) {
    const userId = await requireUserId();

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", targetUserId);

    if (error) throw error;
    return { ok: true as const };
  },

  async myFollowRow(targetUserId: string) {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userId)
      .eq("following_id", targetUserId)
      .maybeSingle();

    if (error) throw error;
    return data; // { id } | null
  },

  // Uses your SQL function public.is_mutual_follow(a,b)
  async isMutualFollow(targetUserId: string) {
    const userId = await requireUserId();

    const { data, error } = await supabase.rpc("is_mutual_follow", {
      a: userId,
      b: targetUserId,
    });

    if (error) throw error;
    return Boolean(data);
  },

  // Uses your SQL function public.can_dm(target_user_id)
  async canDm(targetUserId: string) {
    const { data, error } = await supabase.rpc("can_dm", {
      target_user_id: targetUserId,
    });

    if (error) throw error;
    return Boolean(data);
  },

  async listFollowers(): Promise<UserListRow[]> {
    const userId = await requireUserId();

    const { data: edges, error: edgeErr } = await supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", userId)
      .order("created_at", { ascending: false });

    if (edgeErr) throw edgeErr;

    const ids = (edges ?? []).map((r) => r.follower_id).filter(Boolean);
    if (ids.length === 0) return [];

    const { data: profiles, error: profErr } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .in("user_id", ids);

    if (profErr) throw profErr;

    const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as UserListRow[];
  },

  async listFollowing(): Promise<UserListRow[]> {
    const userId = await requireUserId();

    const { data: edges, error: edgeErr } = await supabase
      .from("follows")
      .select("following_id, created_at")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (edgeErr) throw edgeErr;

    const ids = (edges ?? []).map((r) => r.following_id).filter(Boolean);
    if (ids.length === 0) return [];

    const { data: profiles, error: profErr } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .in("user_id", ids);

    if (profErr) throw profErr;

    const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as UserListRow[];
  },
};
