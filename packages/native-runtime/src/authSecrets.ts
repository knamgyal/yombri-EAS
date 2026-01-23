import * as SecureStore from 'expo-secure-store';

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'yombri.auth.access_token',
  REFRESH_TOKEN: 'yombri.auth.refresh_token',
} as const;

export const authSecrets = {
  getAccessToken: () => SecureStore.getItemAsync(AUTH_KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, token),
  deleteAccessToken: () => SecureStore.deleteItemAsync(AUTH_KEYS.ACCESS_TOKEN),

  getRefreshToken: () => SecureStore.getItemAsync(AUTH_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, token),
  deleteRefreshToken: () => SecureStore.deleteItemAsync(AUTH_KEYS.REFRESH_TOKEN),
};
