import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

interface LogoutButtonProps {
  isExpanded?: boolean;
}

export default function LogoutButton({ isExpanded = true }: LogoutButtonProps) {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:bg-destructive/10 hover:text-destructive w-full",
        "text-sm font-medium",
        !isExpanded && "justify-center",
      )}
      title={!isExpanded ? "Cerrar sesión" : undefined}
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      {isExpanded && <span>Cerrar sesión</span>}
    </button>
  );
}
