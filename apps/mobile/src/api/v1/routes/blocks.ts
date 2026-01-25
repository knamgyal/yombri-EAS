import { supabase } from "@/lib/supabase";

export const blocks = {
  // POST /v1/blocks
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

  // DELETE /v1/blocks/{id}
  async unblockById(blockId: string) {
    const { error } = await supabase.from("user_blocks").delete().eq("id", blockId);
    if (error) throw error;
    return { ok: true as const };
  },

  // GET /v1/me/blocked
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
};
