import { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuthStore } from "@/stores"

interface Props {
  children: ReactNode;
}

export function PrivateRoute({ children }: Props) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
