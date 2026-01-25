// apps/mobile/src/api/v1/routes/follows.ts
import { supabase } from "@/lib/supabase";

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("No authed user");
  return data.user.id;
}

export const follows = {
  // POST /v1/follows
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

  // DELETE /v1/follows/{id}
  async unfollowById(followId: string) {
    const { error } = await supabase.from("follows").delete().eq("id", followId);
    if (error) throw error;
    return { ok: true as const };
  },

  // DELETE /v1/follows?following_id=...
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

  // Helper: returns follow row id if currently following
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
};
