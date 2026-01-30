// apps/mobile/src/api/v1/routes/events.ts
import { supabase } from "@/lib/supabase";

export type EventRow = {
  id: string;
  title: string | null;
  starts_at: string | null;
  created_at: string | null;
};

export const events = {
  async listLatest(limit = 50): Promise<EventRow[]> {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, starts_at, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  async getById(eventId: string): Promise<EventRow | null> {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, starts_at, created_at")
      .eq("id", eventId)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  },
};
