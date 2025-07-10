import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types/Interfaces";

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
