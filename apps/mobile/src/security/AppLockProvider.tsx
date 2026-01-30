import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '@yombri/native-runtime';
import { APP_LOCK_KEYS, DEFAULT_TIMEOUT, AppLockTimeoutSeconds } from './appLock';

/** Allowed policies for app lock */
type Policy = 'disabled' | 'optional' | 'required';

/** Context shape */
type AppLockContextType = {
  policy: Policy;
  timeoutSeconds: AppLockTimeoutSeconds;
  setTimeoutSeconds: (v: AppLockTimeoutSeconds) => Promise<void>;
  isEnabled: boolean;   // derived from policy + timeout
  isUnlocked: boolean;  // session-only state
  requestUnlock: () => Promise<boolean>;
};

// Create context with a forced default to satisfy TypeScript
const AppLockContext = createContext<AppLockContextType>({} as AppLockContextType);

/** Provider for app lock functionality */
export function AppLockProvider({
  children,
  policy = 'optional',
}: {
  children: React.ReactNode;
  policy?: Policy;
}) {
  const [timeoutSeconds, setTimeoutState] = useState<AppLockTimeoutSeconds>(DEFAULT_TIMEOUT);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Track the last time the app went to background
  const lastBackgroundAt = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Determine if app lock is active
  const isEnabled = policy !== 'disabled' && timeoutSeconds !== 0;

  /** Load saved timeout value on mount */
  useEffect(() => {
    const load = async () => {
      const raw = await storage.getString(APP_LOCK_KEYS.TIMEOUT_SECONDS);
      const parsed = raw ? Number(raw) : NaN;

      // Accept only predefined valid timeout values
      if ([0, 30, 120, 300].includes(parsed)) {
        setTimeoutState(parsed as AppLockTimeoutSeconds);
      } else {
        setTimeoutState(DEFAULT_TIMEOUT);
      }
    };
    load();
  }, []);

  /** Ensure required policy has a non-zero timeout */
  useEffect(() => {
    if (policy === 'required' && timeoutSeconds === 0) {
      void setTimeoutSeconds(DEFAULT_TIMEOUT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy]);

  /** Set timeout and persist in storage */
  const setTimeoutSeconds = async (v: AppLockTimeoutSeconds) => {
    setTimeoutState(v);
    await storage.setString(APP_LOCK_KEYS.TIMEOUT_SECONDS, String(v));

    // If lock is disabled, mark app as unlocked
    if (policy === 'disabled' || v === 0) setIsUnlocked(true);
  };

  /** Request unlock using device authentication */
  const requestUnlock = async (): Promise<boolean> => {
    if (!isEnabled) {
      setIsUnlocked(true);
      return true;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    // If no hardware or enrollment, treat as unlocked
    if (!hasHardware || !enrolled) {
      setIsUnlocked(true);
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Yombri',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsUnlocked(true);
      return true;
    }

    return false;
  };

  /** Track app state changes for timeout enforcement */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appState.current;
      appState.current = nextState;

      const goingBackground = nextState === 'background' || nextState === 'inactive';
      const comingActive = prev !== 'active' && nextState === 'active';

      // Record the time when app goes to background
      if (goingBackground) {
        lastBackgroundAt.current = Date.now();
      }

      // Check if app should lock upon returning to foreground
      if (comingActive) {
        if (!isEnabled) {
          setIsUnlocked(true);
          return;
        }

        const t = lastBackgroundAt.current;
        if (t == null) return;

        const elapsedSec = (Date.now() - t) / 1000;
        if (elapsedSec >= timeoutSeconds) {
          setIsUnlocked(false);
        }
      }
    });

    return () => subscription.remove();
  }, [isEnabled, timeoutSeconds]);

  /** Memoize context value for performance */
  const value = useMemo(
    () => ({
      policy,
      timeoutSeconds,
      setTimeoutSeconds,
      isEnabled,
      isUnlocked: isEnabled ? isUnlocked : true, // always unlocked if disabled
      requestUnlock,
    }),
    [policy, timeoutSeconds, isEnabled, isUnlocked]
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

/** Hook for consuming app lock context */
export function useAppLock() {
  return useContext(AppLockContext);
}
