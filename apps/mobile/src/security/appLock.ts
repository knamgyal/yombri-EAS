export const APP_LOCK_KEYS = {
  TIMEOUT_SECONDS: 'yombri.applock.timeout_seconds', // stored as string
} as const;

export type AppLockTimeoutSeconds = 30 | 120 | 300 | 0;

export const APP_LOCK_TIMEOUTS: { label: string; value: AppLockTimeoutSeconds }[] = [
  { label: '30s', value: 30 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
  { label: 'Never', value: 0 },
];

export const DEFAULT_TIMEOUT: AppLockTimeoutSeconds = 120;
