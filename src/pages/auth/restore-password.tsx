import logo from "../../assets/promotorialogotipo_positivo.png";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { useState, useEffect } from "react";
import {
  requestPasswordReset,
  resetPassword,
} from "../../Fetch/restorePassword";

export default function RestorePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Estados para solicitud de email
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para reseteo de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Determinar qué vista mostrar
  const isResetMode = !!token;

  const handleRequestReset = async () => {
    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setEmailSent(true);
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar el email de recuperación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token!, newPassword);
      setResetSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error("Error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Formulario (INVERTIDO) */}
      <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-50 p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Logo" className="h-24 md:h-28" />
          </div>

          {/* VISTA 1: Solicitar recuperación de contraseña */}
          {!isResetMode && !emailSent && (
            <>
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Recuperar contraseña
                </h1>
                <p className="text-gray-600">
                  Ingresa tu correo electrónico y te enviaremos un enlace para
                  restablecer tu contraseña
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleRequestReset}
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>

                <div className="text-center text-sm text-gray-600 mt-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-blue-600 hover:underline"
                  >
                    ← Volver al inicio de sesión
                  </button>
                </div>
              </div>
            </>
          )}

          {/* VISTA 2: Email enviado exitosamente */}
          {!isResetMode && emailSent && (
            <>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Revisa tu correo
                </h1>
                <p className="text-gray-600">
                  Te hemos enviado un enlace de recuperación a{" "}
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Si no recibes el correo en unos minutos, revisa tu carpeta de
                  spam o intenta nuevamente.
                </p>

                <div className="pt-6 space-y-3">
                  <Button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Intentar con otro correo
                  </Button>
                  <button
                    onClick={() => navigate("/login")}
                    className="text-sm text-blue-600 hover:underline block w-full"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              </div>
            </>
          )}

          {/* VISTA 3: Restablecer contraseña con token */}
          {isResetMode && !resetSuccess && (
            <>
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Nueva contraseña
                </h1>
                <p className="text-gray-600">
                  Ingresa tu nueva contraseña para restablecer el acceso a tu
                  cuenta
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nueva contraseña
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Ingresa tu nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmar contraseña
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>La contraseña debe tener:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Al menos 6 caracteres</li>
                    <li>Letras y números (recomendado)</li>
                  </ul>
                </div>

                <Button
                  onClick={handleResetPassword}
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Procesando..." : "Restablecer contraseña"}
                </Button>
              </div>
            </>
          )}

          {/* VISTA 4: Contraseña restablecida exitosamente */}
          {isResetMode && resetSuccess && (
            <>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  ¡Contraseña actualizada!
                </h1>
                <p className="text-gray-600">
                  Tu contraseña ha sido restablecida exitosamente. Serás
                  redirigido al inicio de sesión en unos momentos.
                </p>

                <Button onClick={() => navigate("/login")} className="w-full">
                  Ir al inicio de sesión
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lado derecho - Imagen (INVERTIDO) */}
      <div
        className="hidden md:block md:w-1/3 min-h-screen relative"
        style={{
          backgroundImage: `url('/login/1.jpg')`,
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
              Seguridad es nuestra prioridad
            </h2>
            <p className="text-lg md:text-xl text-white/90">
              Protegemos tu información y te facilitamos el acceso seguro a tu
              cuenta en todo momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
