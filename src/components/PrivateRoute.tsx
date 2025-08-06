import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PrivateRoute({ children }: Props) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
