import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";
import { invalidateSignedUrl } from "@/lib/signedUrlCache";

const AVATAR_EXTS = ["jpg", "png", "webp", "heic", "heif"] as const;

function invalidateAllAvatarKeysFromAnyAvatarPath(path: string) {
  // path is like: "{uid}/avatar.ext"
  const uid = path.split("/")[0];
  if (!uid) return;

  for (const ext of AVATAR_EXTS) {
    invalidateSignedUrl(`avatars:${uid}/avatar.${ext}`);
  }
}

export default function SettingsScreen() {
  const { theme, themeMode, colorScheme, toggleTheme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  async function refreshAvatarPreview(path: string | null) {
    setAvatarPath(path);
    if (!path) {
      setPreviewUrl(null);
      return;
    }

    const signedUrl = await api.v1.avatars.createSignedUrl(path, 60 * 5);
    setPreviewUrl(signedUrl);
  }

  useEffect(() => {
    (async () => {
      try {
        const me = await api.v1.me.getProfile();
        await refreshAvatarPreview(me.avatar_path ?? null);
      } catch (e: any) {
        setStatus(e?.message ?? "Failed to load profile.");
      }
    })();
  }, []);

  async function pickAndUploadAvatar() {
    setBusy(true);
    setStatus(null);

    try {
      let ImagePicker: typeof import("expo-image-picker");
      try {
        ImagePicker = await import("expo-image-picker");
      } catch {
        throw new Error(
          "Image Picker is not available in this dev client build. Rebuild the EAS development client after installing expo-image-picker."
        );
      }

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) throw new Error("Permission denied to access photos.");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) throw new Error("No image URI returned by picker.");

      const upload = await api.v1.avatars.uploadMyAvatarFromUri({
        uri: asset.uri,
        contentType: asset.mimeType ?? undefined,
      });

      // Clear any cached signed URLs for any previous avatar ext.
      invalidateAllAvatarKeysFromAnyAvatarPath(upload.path);

      // Store the private object path in the profile.
      await api.v1.me.patch({ avatar_path: upload.path });

      await refreshAvatarPreview(upload.path);
      setStatus("Avatar updated.");
    } catch (e: any) {
      const msg = e?.message ?? "Failed to update avatar.";
      setStatus(msg);
      if (msg.includes("Rebuild the EAS development client")) {
        Alert.alert("Dev client rebuild needed", msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>Settings</Text>

      <Text style={{ color: theme.colors.text.secondary }}>
        Mode: {themeMode} (resolved: {colorScheme})
      </Text>

      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: theme.colors.onPrimary ?? theme.colors.text.primary }]}>
          Toggle theme
        </Text>
      </Pressable>

      <View style={{ height: 16 }} />

      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Avatar</Text>

      {previewUrl ? (
        <Image
          source={{ uri: previewUrl }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.colors.surface,
          }}
        />
      ) : null}

      <Text style={{ color: theme.colors.text.secondary }}>
        Stored path: {avatarPath ?? "(none)"}
      </Text>

      <Pressable
        onPress={pickAndUploadAvatar}
        disabled={busy}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
            borderWidth: 1,
            opacity: pressed || busy ? 0.7 : 1,
          },
        ]}
      >
        <Text style={{ fontWeight: "700", color: theme.colors.text.primary }}>
          {busy ? "Uploading..." : "Pick & upload avatar"}
        </Text>
      </Pressable>

      {status ? <Text style={{ color: theme.colors.text.secondary }}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "800" },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  button: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, alignItems: "center" },
  buttonText: { fontSize: 15, fontWeight: "700" },
});
