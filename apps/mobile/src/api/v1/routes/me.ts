import { supabase } from "@/lib/supabase";

export type MePatchInput = {
  display_name?: string | null;
  avatar_path?: string | null;

  // Optional backwards compatibility if older UI still sends avatar_url:
  avatar_url?: string | null;
};

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

export const me = {
  async getProfile() {
    const uid = await requireUserId();

    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .eq("user_id", uid)
      .single();

    if (error) throw error;
    return data as {
      user_id: string;
      display_name: string | null;
      avatar_path: string | null;
    };
  },

  async patch(input: MePatchInput) {
    const uid = await requireUserId();

    // If an older caller sends avatar_url, map it.
    const avatar_path =
      typeof input.avatar_path !== "undefined"
        ? input.avatar_path
        : typeof input.avatar_url !== "undefined"
          ? input.avatar_url
          : undefined;

    const patch: Record<string, any> = {};
    if (typeof input.display_name !== "undefined") patch.display_name = input.display_name;
    if (typeof avatar_path !== "undefined") patch.avatar_path = avatar_path;

    const { error } = await supabase.from("user_profiles").update(patch).eq("user_id", uid);

    if (error) throw error;

    return { ok: true };
  },
};
