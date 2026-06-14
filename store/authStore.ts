import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  token: string | null;
  userId: number | null;
  setToken: (token: string) => Promise<void>;
  setUserId: (id: number) => void;
  clearToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  setToken: async (token) => {
    await SecureStore.setItemAsync("accessToken", token);
    set({ token });
  },
  setUserId: (id) => set({ userId: id }),
  clearToken: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    set({ token: null, userId: null });
  },
}));
