import { supabase } from "@/lib/supabase";

export type UserProfile = {
  user_id: string;
  display_name: string | null;
  avatar_path: string | null;
};

export const profiles = {
  async getByUserId(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_path")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return (data ?? null) as UserProfile | null;
  },
};
