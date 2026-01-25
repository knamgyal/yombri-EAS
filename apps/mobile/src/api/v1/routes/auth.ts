import { supabase } from "@/lib/supabase";

export const auth = {
  // POST /v1/auth/login
  async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  // POST /v1/auth/signup  (keep off UI for now because signup sends emails + rate limits) [web:97]
  async signup(email: string, password: string) {
    return supabase.auth.signUp({ email, password });
  },

  async logout() {
    return supabase.auth.signOut();
  },
};
