import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useTheme } from "@yombri/native-runtime";
import { api } from "@/api/v1";
import {
  getCachedSignedUrl,
  invalidateSignedUrl,
  setCachedSignedUrl,
  setNegativeCache,
} from "@/lib/signedUrlCache";

function cacheKey(bucket: string, path: string) {
  return `${bucket}:${path}`;
}

export function AvatarPathImage(props: {
  avatarPath: string | null | undefined;
  size?: number;
  ttlSeconds?: number; // keep short (60–300)
}) {
  const { theme } = useTheme();
  const { avatarPath, size = 40, ttlSeconds = 60 } = props;

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!avatarPath) {
        setSignedUrl(null);
        return;
      }

      const key = cacheKey("avatars", avatarPath);

      // 1) Serve from cache if still fresh.
      const cached = getCachedSignedUrl(key);
      if (cached) {
        setSignedUrl(cached);
        return;
      }

      // 2) Not cached (or expired): mint a new signed URL.
      setLoading(true);
      try {
        const url = await api.v1.avatars.createSignedUrl(avatarPath, ttlSeconds);

        // Save to cache with expiry.
        setCachedSignedUrl({ key, url, expiresInSeconds: ttlSeconds });

        if (alive) setSignedUrl(url);
      } catch {
        // If blocked / denied by RLS / missing object, avoid hammering.
        setNegativeCache(key);
        if (alive) setSignedUrl(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [avatarPath, ttlSeconds]);

  // If the avatarPath changes (rare), invalidate old cached entry just in case.
  useEffect(() => {
    if (!avatarPath) return;
    const key = cacheKey("avatars", avatarPath);
    return () => invalidateSignedUrl(key);
  }, [avatarPath]);

  const radius = size / 2;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline ?? "rgba(0,0,0,0.15)",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator />
      ) : signedUrl ? (
        <Image source={{ uri: signedUrl }} style={{ width: size, height: size, borderRadius: radius }} />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
  },
});
