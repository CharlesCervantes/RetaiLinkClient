import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { registerUser } from "../Fetch/login";

interface DebugRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface DebugForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

interface AlertState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function DebugRegisterModal({ isOpen, onClose }: DebugRegisterModalProps) {
  const [debugForm, setDebugForm] = useState<DebugForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });

  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showAlert = (type: 'success' | 'error', title: string, message: string) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const handleDebugRegister = async () => {
    // Validaciones básicas
    if (!debugForm.username || !debugForm.email || !debugForm.password) {
      showAlert(
        'error',
        'Campos requeridos',
        'Por favor completa todos los campos obligatorios'
      );

      console.log("Formulario incompleto:", debugForm);

      return;
    }
    
    if (debugForm.password !== debugForm.confirmPassword) {
      showAlert(
        'error',
        'Contraseñas no coinciden',
        'Las contraseñas ingresadas no son iguales'
      );
      return;
    }

    try {
      const new_super_user = {
        vc_username: debugForm.email,
        vc_password: debugForm.password,
        vc_nombre: debugForm.username,
        id_negocio: 0,
        i_rol: 1, 
      };

      const response = await registerUser(new_super_user);
      console.log("Registro:", response);
      
      showAlert(
        'success',
        'Usuario registrado',
        `El usuario ${debugForm.username} ha sido registrado exitosamente`
      );

      // Limpiar formulario después del éxito
      setDebugForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
      });
      
    } catch (error) {
      console.error("Error en registro debug:", error);
      showAlert(
        'error',
        'Error al registrar',
        'Ocurrió un error al intentar registrar el usuario. Por favor intenta nuevamente.'
      );
    }
  };

  const handleInputChange = (field: keyof DebugForm, value: string) => {
    setDebugForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    setDebugForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: ""
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🔧 Registro Debug
              </h2>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <Input
                  type="text"
                  placeholder="Nombre completo"
                  value={debugForm.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={debugForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={debugForm.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña *
                </label>
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={debugForm.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Modo Debug:</strong> Esta funcionalidad es solo para desarrollo y testing.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDebugRegister}
                className="flex-1"
              >
                Registrar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AlertDialog para notificaciones */}
      <AlertDialog open={alert.isOpen} onOpenChange={closeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alert.type === 'success' ? (
                <span className="text-green-600">✅</span>
              ) : (
                <span className="text-red-600">❌</span>
              )}
              {alert.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeAlert}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}