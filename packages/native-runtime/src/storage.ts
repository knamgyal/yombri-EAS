import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

// --- 1) DETECTION FLOW ---
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isWeb = Platform.OS === 'web';

// --- 2) SAFE NATIVE LOADING ---
let didLogMmkvFailure = false;
let mmkvInstance: any = null;

if (!isExpoGo && !isWeb) {
  try {
    // Dynamic require to prevent Metro/Expo Go crashes
    // (MMKV is a native module, so it must exist in the binary)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MMKV } = require('react-native-mmkv');
    mmkvInstance = new MMKV();
  } catch (e) {
    if (!didLogMmkvFailure) {
      didLogMmkvFailure = true;
      console.log('[Storage] MMKV not found or failed to load. Falling back to AsyncStorage.');
    }
  }
}

// --- 3) RUNTIME INTROSPECTION HELPER ---
export function getStorageType(): 'AsyncStorage' | 'MMKV' | 'WebLocalStorage' {
  if (isWeb) return 'WebLocalStorage';
  return mmkvInstance ? 'MMKV' : 'AsyncStorage';
}

// --- 4) CENTRALIZED STORAGE KEYS ---
export const STORAGE_KEYS = {
  THEME_MODE: 'yombri.theme_mode',
  SUNSET_TRANSITION: 'yombri.sunset_transition',
} as const;

// --- 5) SINGLE STORAGE CONTRACT (Promise-Based) ---
export const storage = {
  getString: async (key: string): Promise<string | null> => {
    if (mmkvInstance) {
      const val = mmkvInstance.getString(key);
      return val !== undefined ? val : null;
    }
    return AsyncStorage.getItem(key);
  },

  setString: async (key: string, value: string): Promise<void> => {
    if (mmkvInstance) {
      mmkvInstance.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  getBoolean: async (key: string): Promise<boolean | null> => {
    if (mmkvInstance) {
      const val = mmkvInstance.getBoolean(key);
      return val !== undefined ? val : null;
    }

    const val = await AsyncStorage.getItem(key);
    if (val === null) return null;
    return val === 'true';
  },

  setBoolean: async (key: string, value: boolean): Promise<void> => {
    if (mmkvInstance) {
      mmkvInstance.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, String(value));
  },

  delete: async (key: string): Promise<void> => {
    if (mmkvInstance) {
      mmkvInstance.delete(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },

  clearAll: async (): Promise<void> => {
    if (mmkvInstance) {
      mmkvInstance.clearAll();
      return;
    }
    await AsyncStorage.clear();
  },
};
