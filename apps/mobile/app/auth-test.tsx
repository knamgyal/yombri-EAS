// apps/mobile/app/auth-test.tsx
import { Redirect } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../src/lib/supabase";
import { api } from "../src/api/v1";

const DEFAULT_TEST_EMAIL = "usera@yombri.dev";
const DEFAULT_TEST_PASSWORD = "passworda";

function formatAuthError(error: unknown) {
  const e = error as { message?: string; status?: number; code?: string; name?: string };
  return [
    `message=${e?.message ?? "unknown"}`,
    `name=${e?.name ?? "n/a"}`,
    `status=${e?.status ?? "n/a"}`,
    `code=${e?.code ?? "n/a"}`,
  ].join(" | ");
}

export default function AuthTest() {
  if (!__DEV__) return <Redirect href="/(auth)/sign-in" />;

  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("Ready");
  const append = (msg: string) => setLog((prev) => `${prev}\n${msg}`);

  const [email, setEmail] = useState(DEFAULT_TEST_EMAIL);
  const [password, setPassword] = useState(DEFAULT_TEST_PASSWORD);

  const USER_A = useMemo(() => ({ email: "usera@yombri.dev", password: "passworda" }), []);
  const USER_B = useMemo(() => ({ email: "userb@yombri.dev", password: "passwordb" }), []);

  const [probeUserId, setProbeUserId] = useState("");

  async function signInWithInputs() {
    if (busy) return;

    setBusy(true);
    append("signInWithPassword");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return append(`signIn error: ${formatAuthError(error)}`);
      append(`signIn ok: userId=${data.user?.id ?? "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  async function whoAmI() {
    append("getUser");
    const { data, error } = await supabase.auth.getUser();
    if (error) return append(`getUser error: ${formatAuthError(error)}`);
    append(`getUser ok: userId=${data.user?.id ?? "null"}`);
  }

  async function probeProfileVisibility() {
    const id = probeUserId.trim();
    if (!id) return append("probe: enter a user_id uuid first");

    append(`probeProfileVisibility user_id=${id}`);
    try {
      const rows = await api.v1.me.getProfileByUserId(id);
      if (rows.length === 0) {
        append("probe result: 0 rows (hidden by RLS OR user/profile not found)");
      } else {
        const r = rows[0] as any;
        append(`probe result: VISIBLE user_id=${r.user_id} display_name=${r.display_name ?? "null"}`);
      }
    } catch (e: any) {
      append(`probe error: ${e?.message ?? "unknown"}`);
    }
  }

  async function signOut() {
    append("signOut");
    const { error } = await supabase.auth.signOut();
    if (error) append(`signOut error: ${formatAuthError(error)}`);
    else append("signOut ok");
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setLog(`Initial getSession error: ${formatAuthError(error)}`);
      else setLog(data.session ? `Initial session: ${data.session.user.id}` : "Initial session: null");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      // Keep synchronous; Supabase warns async/await here can deadlock. [web:56]
      append(`Auth event: ${event}; session=${session ? "present" : "null"}`);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: "600" }}>Supabase Auth Test (dev-only)</Text>

      <Text style={{ fontWeight: "600" }}>Credentials</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
      />

      <Button title={busy ? "Signing in..." : "Sign in"} onPress={signInWithInputs} disabled={busy} />

      <Button
        title="Use User A creds"
        onPress={() => {
          setEmail(USER_A.email);
          setPassword(USER_A.password);
          append("Loaded User A creds");
        }}
      />
      <Button
        title="Use User B creds"
        onPress={() => {
          setEmail(USER_B.email);
          setPassword(USER_B.password);
          append("Loaded User B creds");
        }}
      />

      <Button title="Who am I? (getUser)" onPress={whoAmI} />
      <Button title="Sign out" onPress={signOut} />

      <Text style={{ marginTop: 12, fontWeight: "600" }}>RLS probe: profile visibility</Text>
      <TextInput
        placeholder="Target user_id (uuid)"
        value={probeUserId}
        onChangeText={setProbeUserId}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
      />
      <Button title="Probe profile visibility (RLS)" onPress={probeProfileVisibility} />

      <Text selectable style={{ marginTop: 12 }}>
        {log}
      </Text>
    </View>
  );
}
