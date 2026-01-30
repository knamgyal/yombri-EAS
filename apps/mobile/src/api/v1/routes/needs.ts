import { supabase } from "@/lib/supabase";

type NeedRow = {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
};

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

export const needs = {
  async listByOrg(orgId: string): Promise<NeedRow[]> {
    const { data, error } = await supabase
      .from("needs")
      .select("id, org_id, title, description, created_by, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as NeedRow[];
  },

  async create(params: { orgId: string; title: string; description?: string | null }): Promise<NeedRow> {
    const uid = await requireUserId();

    const { data, error } = await supabase
      .from("needs")
      .insert({
        org_id: params.orgId,
        title: params.title,
        description: params.description ?? null,
        created_by: uid,
      })
      .select("id, org_id, title, description, created_by, created_at")
      .single();

    if (error) throw error;
    return data as NeedRow;
  },
};
