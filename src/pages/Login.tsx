import logo from '../assets/promotorialogotipo_positivo.png';
import background from '../assets/patron3_ppt.png';
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { loginUser } from "../Fetch/login";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const authstore = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!username || !password) return;
    try {
      const response = await loginUser(username, password);
      console.log("LOGIN RESPONSE", response)
      authstore.login(response.data.token, response.data.user);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Usuario o contraseña incorrectos");
    }
  };
  

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-50"
      style={{backgroundImage: `url(${background})` }}
    >
      <div className="w-full max-w-sm space-y-6 p-6 bg-white shadow rounded">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Logo" className="h-28" />
        </div>
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
