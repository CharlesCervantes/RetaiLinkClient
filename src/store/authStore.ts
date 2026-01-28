import { persist } from "zustand/middleware";
import { User } from "../types/Interfaces";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  token: string | null;
  id_client: number | null;

  // Acciones
  login: (token: string, user: User) => void;
  logout: () => void;

  // Selectores
  isAuthenticated: () => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      // Selectores como funciones para evitar problemas de reactividad
      isAuthenticated: () => !!get().token,
      isSuperAdmin: () => get().user?.i_rol === 1,
      isAdmin: () => get().user?.i_rol === 2,
    }),
    {
      name: "auth-storage",
    }
  )
);
