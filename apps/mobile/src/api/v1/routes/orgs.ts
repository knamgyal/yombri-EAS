import { supabase } from "@/lib/supabase";

export type OrgRow = {
  id: string;
  name: string;
  mission: string | null;
  verified: boolean;
  created_at: string;
};

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

export const orgs = {
  // membership-only (for org admins/staff views)
  async listMyOrgs(): Promise<OrgRow[]> {
    const uid = await requireUserId();

    const { data: memberships, error: mErr } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", uid);

    if (mErr) throw mErr;

    const ids = (memberships ?? []).map((m: any) => m.org_id);
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("orgs")
      .select("id, name, mission, verified, created_at")
      .in("id", ids)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as OrgRow[];
  },

  // discoverable (for sponsors)
  async listOrgs(): Promise<OrgRow[]> {
    const { data, error } = await supabase
      .from("orgs")
      .select("id, name, mission, verified, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as OrgRow[];
  },

  async getOrgById(orgId: string): Promise<OrgRow> {
    const { data, error } = await supabase
      .from("orgs")
      .select("id, name, mission, verified, created_at")
      .eq("id", orgId)
      .single();

    if (error) throw error;
    return data as OrgRow;
  },

  async createOrg(input: { name: string; mission?: string | null; location_radius_km?: number | null }) {
    const uid = await requireUserId();

    const { data: org, error: orgErr } = await supabase
      .from("orgs")
      .insert({
        name: input.name,
        mission: input.mission ?? null,
        location_radius_km: input.location_radius_km ?? null,
        created_by: uid,
      })
      .select("id, name, mission, verified, created_at")
      .single();

    if (orgErr) throw orgErr;

    // Add creator as admin
    const { error: mErr } = await supabase.from("org_members").insert({
      org_id: org.id,
      user_id: uid,
      role: "admin",
    });

    if (mErr) throw mErr;

    return org as OrgRow;
  },
};
