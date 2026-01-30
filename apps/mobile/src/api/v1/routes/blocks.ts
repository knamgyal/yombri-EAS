import { supabase } from "@/lib/supabase";

type BlockedUserRow = {
  block_id: string;
  user_id: string;
  display_name: string | null;
  avatar_path: string | null;
};

export const blocks = {
  async block(targetUserId: string) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!userData.user) throw new Error("No authed user");

    const { data, error } = await supabase
      .from("user_blocks")
      .insert({
        blocker_id: userData.user.id,
        blocked_id: targetUserId,
      })
      .select("id, blocker_id, blocked_id, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async unblockById(blockId: string) {
    const { error } = await supabase.from("user_blocks").delete().eq("id", blockId);
    if (error) throw error;
    return { ok: true as const };
  },

  async unblockByUserId(targetUserId: string) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!userData.user) throw new Error("No authed user");

    const { error } = await supabase
      .from("user_blocks")
      .delete()
      .eq("blocker_id", userData.user.id)
      .eq("blocked_id", targetUserId);

    if (error) throw error;
    return { ok: true as const };
  },

  async myBlocked() {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!userData.user) throw new Error("No authed user");

    const { data, error } = await supabase
      .from("user_blocks")
      .select("id, blocked_id, created_at")
      .eq("blocker_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async listBlockedUsers(): Promise<BlockedUserRow[]> {
    const myBlocks = await this.myBlocked();
    const ids = myBlocks.map((b) => b.blocked_id);
    if (ids.length === 0) return [];

    // Note: Depending on your RLS policy, profiles for blocked users may not be selectable. [file:2]
    const { data: profiles, error: profErr } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .in("user_id", ids);

    if (profErr) throw profErr;

    const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    return myBlocks.map((b) => {
      const p = byId.get(b.blocked_id);
      return {
        block_id: b.id,
        user_id: b.blocked_id,
        display_name: p?.display_name ?? null,
        avatar_path: p?.avatar_path ?? null,
      };
    });
  },
};
