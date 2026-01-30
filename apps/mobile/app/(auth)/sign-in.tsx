// apps/mobile/app/(auth)/sign-in.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Redirect, router } from "expo-router";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";
import { useSession } from "@/ctx/session";

export default function SignInScreen() {
  const { theme } = useTheme();
  const { session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, leave the auth group immediately.
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  async function onSignIn() {
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await api.v1.auth.login(email.trim(), password);
      if (error) throw error;

      // After successful sign-in, go to tabs.
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message ?? "Sign-in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Sign in</Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={theme.colors.text.secondary}
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          {
            borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
            color: theme.colors.text.primary,
          },
        ]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.colors.text.secondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[
          styles.input,
          {
            borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
            color: theme.colors.text.primary,
          },
        ]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={onSignIn}
        disabled={submitting}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.primary, opacity: pressed || submitting ? 0.75 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary ?? "#fff" }]}>
          {submitting ? "Signing in..." : "Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  button: { paddingVertical: 12, borderRadius: 12, alignItems: "center", marginTop: 6 },
  buttonText: { fontSize: 16, fontWeight: "700" },
  error: { color: "crimson" },
});
