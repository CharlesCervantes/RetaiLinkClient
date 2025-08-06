import { persist } from "zustand/middleware";
import { User } from "../types/Interfaces";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  token: string | null;
  idNegocio: number | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      idNegocio: null,
      login: (token, user) =>
        set({
          user,
          token,
          idNegocio: user.id_negocio,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          idNegocio: null,
        }),
    }),
    {
      name: "auth-storage", 
    }
  )
);
