import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  token: string | null;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: async (token) => {
    await SecureStore.setItemAsync("accessToken", token);
    set({ token });
  },
  clearToken: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    set({ token: null });
  },
}));
