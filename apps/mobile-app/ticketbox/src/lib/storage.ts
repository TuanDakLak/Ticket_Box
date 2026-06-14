import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/app-config';

export type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export const tokenStorage = {
  async getTokens(): Promise<StoredTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.accessToken),
      AsyncStorage.getItem(STORAGE_KEYS.refreshToken),
    ]);

    return { accessToken, refreshToken };
  },

  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.accessToken, accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken),
    ]);
  },

  async clearTokens() {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.accessToken),
      AsyncStorage.removeItem(STORAGE_KEYS.refreshToken),
    ]);
  },
};
