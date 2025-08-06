import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Limpia el estado
    navigate("/login"); // Redirige al login
  };

  return (
    <Button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 mt-4 bg-gray-200 text-black"
      variant="destructive"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </Button>
  );
}
