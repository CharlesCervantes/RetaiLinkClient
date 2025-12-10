import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "../store/authStore";
import { loginUser } from "../Fetch/login";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import DebugRegisterModal from "../components/DebugRegisterModal";

import logo from "../assets/promotorialogotipo_positivo.png";

export default function Login() {
  const navigate = useNavigate();
  const authstore = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showDebugModal, setShowDebugModal] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) return;
    try {
      const response = await loginUser(username, password);
      console.log("LOGIN RESPONSE", response);
      authstore.login(response.data.token, response.data.user);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Usuario o contraseña incorrectos");
    }
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Lado izquierdo - Imagen con información */}
        <div
          className="hidden md:block md:w-1/3 min-h-screen relative"
          style={{
            backgroundImage: `url('/login/2.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-brightness-50"></div>
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-12">
            <div className="flex justify-start">
              <img
                src="/promotorialogotipo_principalblanco.png"
                alt="Logo"
                className="h-16 md:h-20 lg:h-24"
              />
            </div>
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                Inventarios Precisos, sin Complicaciones
              </h2>
              <p className="text-lg md:text-xl text-white/90">
                PromotorIA conecta tu tienda con promotores confiables para
                realizar conteos de inventario en tiempo real, rápido y sin
                errores.
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario de login */}
        <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-50 p-6 md:p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Logo" className="h-24 md:h-28" />
            </div>

            {/* Título y descripción */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Bienvenido de nuevo
              </h1>
              <p className="text-gray-600">
                Ingresa tus credenciales para acceder a tu cuenta
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Usuario
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Botón de inicio de sesión */}
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Iniciar sesión
              </Button>

              {/* Olvidé mi contraseña */}
              <div className="text-center text-xs text-gray-500 mt-8">
                <button
                  onClick={() => navigate("/restore-pwd")}
                  className="text-blue-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    ¿No tienes una cuenta?
                  </span>
                </div>
              </div>

              {/* Solicitar prueba */}
              <div className="text-center space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 font-medium">
                  Descubre cómo PromotorIA puede transformar tu negocio
                </p>
                <Button
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  onClick={() =>
                    toast.error("Redirigir a página de solicitud de prueba")
                  }
                >
                  Solicita tu prueba gratuita
                </Button>
              </div>

              {/* Botón Debug (solo desarrollo) */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  onClick={() => setShowDebugModal(true)}
                  variant="outline"
                  className="w-full text-sm text-gray-600 border-dashed"
                >
                  🔧 Registrar Usuario Debug
                </Button>
              )}
            </div>

            {/* Footer opcional */}
            <div className="text-center text-xs text-gray-500 mt-8">
              Al iniciar sesión, aceptas nuestros{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Registro Debug */}
      <DebugRegisterModal
        isOpen={showDebugModal}
        onClose={() => setShowDebugModal(false)}
      />
    </>
  );
}
