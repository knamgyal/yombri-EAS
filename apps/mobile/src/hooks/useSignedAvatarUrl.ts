import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@/api/v1";
import { getCachedSignedUrl, setCachedSignedUrl, setNegativeCache } from "@/lib/signedUrlCache";

function cacheKey(bucket: string, path: string) {
  return `${bucket}:${path}`;
}

export function useSignedAvatarUrl(
  avatarPath: string | null | undefined,
  expiresInSec = 60
) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const canLoad = useMemo(() => Boolean(avatarPath), [avatarPath]);

  const refresh = useCallback(async () => {
    if (!avatarPath) {
      setSignedUrl(null);
      return;
    }

    const key = cacheKey("avatars", avatarPath);

    // Serve from cache if still fresh.
    const cached = getCachedSignedUrl(key);
    if (cached) {
      setSignedUrl(cached);
      return;
    }

    setLoading(true);
    setErrorText(null);

    try {
      const url = await api.v1.avatars.createSignedUrl(avatarPath, expiresInSec);
      setCachedSignedUrl({ key, url, expiresInSeconds: expiresInSec });
      setSignedUrl(url);
    } catch (e: any) {
      setSignedUrl(null);
      setNegativeCache(key);
      setErrorText(e?.message ?? "Failed to create signed URL");
    } finally {
      setLoading(false);
    }
  }, [avatarPath, expiresInSec]);

  // Initial load / when path changes
  useEffect(() => {
    if (!canLoad) {
      setSignedUrl(null);
      return;
    }
    refresh();
  }, [canLoad, refresh]);

  // Refresh when screen comes into focus (TTL is short by design)
  useFocusEffect(
    useCallback(() => {
      if (canLoad) refresh();
    }, [canLoad, refresh])
  );

  return { signedUrl, loading, errorText, refresh };
}
