import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '@yombri/native-runtime';
import { APP_LOCK_KEYS, DEFAULT_TIMEOUT, AppLockTimeoutSeconds } from './appLock';

type Policy = 'disabled' | 'optional' | 'required';

type AppLockContextType = {
  policy: Policy;
  timeoutSeconds: AppLockTimeoutSeconds;
  setTimeoutSeconds: (v: AppLockTimeoutSeconds) => Promise<void>;
  isEnabled: boolean;   // derived
  isUnlocked: boolean;  // session-only
  requestUnlock: () => Promise<boolean>;
};

const AppLockContext = createContext<AppLockContextType>({} as AppLockContextType);

export function AppLockProvider({
  children,
  policy = 'optional',
}: {
  children: React.ReactNode;
  policy?: Policy;
}) {
  const [timeoutSeconds, setTimeoutState] = useState<AppLockTimeoutSeconds>(DEFAULT_TIMEOUT);
  const [isUnlocked, setIsUnlocked] = useState(true);

  const lastBackgroundAt = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const isEnabled = policy !== 'disabled' && timeoutSeconds !== 0;

  useEffect(() => {
    const load = async () => {
      const raw = await storage.getString(APP_LOCK_KEYS.TIMEOUT_SECONDS);
      const parsed = raw ? Number(raw) : NaN;
      if (parsed === 0 || parsed === 30 || parsed === 120 || parsed === 300) {
        setTimeoutState(parsed as AppLockTimeoutSeconds);
      } else {
        setTimeoutState(DEFAULT_TIMEOUT);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (policy === 'required' && timeoutSeconds === 0) {
      void setTimeoutSeconds(DEFAULT_TIMEOUT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy]);

  const setTimeoutSeconds = async (v: AppLockTimeoutSeconds) => {
    setTimeoutState(v);
    await storage.setString(APP_LOCK_KEYS.TIMEOUT_SECONDS, String(v));
    if (policy === 'disabled' || v === 0) setIsUnlocked(true);
  };

  const requestUnlock = async () => {
    if (!isEnabled) {
      setIsUnlocked(true);
      return true;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    // If not available, don't brick the app—treat as unlocked for now.
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

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appState.current;
      appState.current = nextState;

      const goingBackground = nextState === 'background' || nextState === 'inactive';
      const comingActive = prev !== 'active' && nextState === 'active';

      if (goingBackground) {
        lastBackgroundAt.current = Date.now();
      }

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

    return () => sub.remove();
  }, [isEnabled, timeoutSeconds]);

  const value = useMemo(
    () => ({
      policy,
      timeoutSeconds,
      setTimeoutSeconds,
      isEnabled,
      isUnlocked: isEnabled ? isUnlocked : true,
      requestUnlock,
    }),
    [policy, timeoutSeconds, isEnabled, isUnlocked]
  );

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock() {
  return useContext(AppLockContext);
}
