import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}
