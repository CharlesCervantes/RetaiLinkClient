import { persist } from "zustand/middleware";
import { User } from "../types/Interfaces";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  token: string | null;
  id_client: number | null;

  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      id_client: null,
      login: (token, user) =>
        set({
          user,
          token,
          id_client: user.id_client || null,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          id_client: null,
        }),
    }),
    {
      name: "auth-storage", 
    }
  )
);
