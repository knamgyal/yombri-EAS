// apps/mobile/src/api/v1/routes/me.ts
import { supabase } from "@/lib/supabase";

export type MeResponse = {
  userId: string;
  email?: string | null;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const me = {
  // DEV ONLY: verify blocked users cannot read profiles
  async getProfileByUserId(userId: string) {
    if (!__DEV__) throw new Error("DEV ONLY: getProfileByUserId is disabled in production");

    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_url")
      .eq("user_id", userId);

    if (error) throw error;
    return data ?? [];
  },

  // GET /v1/me
  async get(): Promise<MeResponse> {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!userData.user) throw new Error("No authed user");

    const userId = userData.user.id;

    const { data: profile, error: profileErr } = await supabase
      .from("user_profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileErr) throw profileErr;

    return {
      userId,
      email: userData.user.email,
      profile: profile ?? null,
    };
  },

  // PATCH /v1/me
  async patch(input: { display_name?: string | null; avatar_url?: string | null }) {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!userData.user) throw new Error("No authed user");

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
        ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
      })
      .eq("user_id", userId)
      .select("display_name, avatar_url")
      .single();

    if (error) throw error;
    return data;
  },
};
