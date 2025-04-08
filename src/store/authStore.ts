// src/store/authStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  isAuthenticated: boolean
  email: string | null
  organization: string | null

  login: (email: string, organization?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      organization: null,

      login: (email, organization = null) =>
        set({ isAuthenticated: true, email, organization }),

      logout: () =>
        set({ isAuthenticated: false, email: null, organization: null }),
    }),
    {
      name: "auth-storage",
    }
  )
)
