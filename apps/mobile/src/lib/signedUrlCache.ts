type CacheEntry = {
  url: string | null;
  expiresAtMs: number;
};

const cache = new Map<string, CacheEntry>();

// Safety margin so we refresh a bit before actual expiry (clock skew / slow renders).
const DEFAULT_SKEW_MS = 10_000;

// Short negative cache to avoid hammering createSignedUrl() on denied paths (blocked / missing).
const NEGATIVE_CACHE_MS = 15_000;

function nowMs() {
  return Date.now();
}

export function getCachedSignedUrl(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (nowMs() >= entry.expiresAtMs) {
    cache.delete(key);
    return null;
  }

  return entry.url;
}

export function setCachedSignedUrl(params: {
  key: string;
  url: string | null;
  expiresInSeconds: number;
  skewMs?: number;
}) {
  const { key, url, expiresInSeconds, skewMs = DEFAULT_SKEW_MS } = params;

  const ttlMs = Math.max(0, expiresInSeconds * 1000 - skewMs);
  const expiresAtMs = nowMs() + ttlMs;

  cache.set(key, { url, expiresAtMs });
}

export function setNegativeCache(key: string) {
  cache.set(key, { url: null, expiresAtMs: nowMs() + NEGATIVE_CACHE_MS });
}

export function invalidateSignedUrl(key: string) {
  cache.delete(key);
}

export function clearSignedUrlCache() {
  cache.clear();
}
