import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
