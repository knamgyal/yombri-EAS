import * as SecureStore from 'expo-secure-store';

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'yombri.auth.access_token',
  REFRESH_TOKEN: 'yombri.auth.refresh_token',
} as const;

export async function getAccessToken() {
  return SecureStore.getItemAsync(AUTH_KEYS.ACCESS_TOKEN);
}

export async function setAccessToken(token: string) {
  return SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, token);
}

export async function deleteAccessToken() {
  return SecureStore.deleteItemAsync(AUTH_KEYS.ACCESS_TOKEN);
}
