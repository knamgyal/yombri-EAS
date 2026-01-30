import { supabase } from "@/lib/supabase";

export type PledgeStatus = "pending" | "accepted" | "rejected" | "delivered" | "confirmed";

export type PledgeRow = {
  id: string;
  need_id: string;
  sponsor_id: string;
  status: PledgeStatus;
  created_at: string;
};

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

export const pledges = {
  async listForNeed(needId: string): Promise<PledgeRow[]> {
    const { data, error } = await supabase
      .from("pledges")
      .select("id, need_id, sponsor_id, status, created_at")
      .eq("need_id", needId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as PledgeRow[];
  },

  async createForNeed(needId: string): Promise<PledgeRow> {
    const uid = await requireUserId();

    const { data, error } = await supabase
      .from("pledges")
      .insert({ need_id: needId, sponsor_id: uid, status: "pending" })
      .select("id, need_id, sponsor_id, status, created_at")
      .single();

    if (error) throw error;
    return data as PledgeRow;
  },

  async setStatus(pledgeId: string, status: PledgeStatus): Promise<void> {
    const { error } = await supabase.from("pledges").update({ status }).eq("id", pledgeId);
    if (error) throw error;
  },
};
