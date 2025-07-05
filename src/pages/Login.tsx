import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { loginUser } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!username || !password) return;
    try {
      const response = await loginUser(username, password);
      authStore.login(response.data.user, response.data.token);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 p-6 bg-white shadow rounded">
        <h1 className="text-xl font-bold text-center">Iniciar sesión</h1>
        <Input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSubmit} className="w-full">
          Iniciar sesión
        </Button>
      </div>
    </div>
  );
}
