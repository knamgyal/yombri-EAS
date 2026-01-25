import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
    lockAcquireTimeout: 30000, // was effectively 10000ms; increase to reduce spurious timeouts [web:416]
  },
});


// Register AppState listener only once (important in dev / fast refresh). [web:168][web:170]
declare global {
  // eslint-disable-next-line no-var
  var __yombriSupabaseAppStateListenerInstalled: boolean | undefined;
}

if (Platform.OS !== "web" && !globalThis.__yombriSupabaseAppStateListenerInstalled) {
  globalThis.__yombriSupabaseAppStateListenerInstalled = true;

  const handle = (state: string) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  };

  // Apply once for initial state as well (covers cold start where no change event fires).
  handle(AppState.currentState);

  AppState.addEventListener("change", handle);
}
