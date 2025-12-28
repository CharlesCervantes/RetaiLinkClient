import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Mail,
  FileText,
  Save,
  AlertCircle,
} from "lucide-react";

import { MensajeConfirmacion } from "../components/mensajeConfirmaacion";

type FormErrors = {
  [key: string]: string | null;
};


export default function NuevoCliente() {
  // --------------- Instanciamiento de librerias
  const navigate = useNavigate();

  // --------------- States
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    vc_nombre: "",
    vc_rfc: "",
    vc_email: "",
    vc_telefono: "",
    vc_direccion: "",
    vc_ciudad: "",
    vc_observaciones: "",
    b_activo: true,
  });

  const haveData = Boolean(
    formData.vc_nombre.trim() ||
    formData.vc_rfc.trim() ||
    formData.vc_email.trim() ||
    formData.vc_telefono.trim() ||
    formData.vc_direccion.trim() ||
    formData.vc_ciudad.trim() ||
    formData.vc_observaciones.trim()
  );

  // --------------- handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    let finalValue: string | boolean =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;

    if (name === "vc_rfc") {
      finalValue = formatRFC(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Cliente creado:", formData);
      toast.success("Cliente creado exitosamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (haveData) {
      setShowConfirm(true);
    } else {
      navigate('/clientes');
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    navigate('/clientes');
  };

 // --------------- Funciones de utilidad 
  const formatRFC = (value: string) => {
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 13);
  };

  const validateRFC = (rfc: string) => {
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc) && (rfc.length === 12 || rfc.length === 13);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/[\s()-+]/g, "");
    return /^(\+?52)?[0-9]{10}$/.test(cleaned);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.vc_nombre.trim()) {
      newErrors.vc_nombre = "El nombre es requerido";
    }

    if (formData.vc_rfc.trim() && !validateRFC(formData.vc_rfc)) {
      newErrors.vc_rfc = "RFC inválido (12-13 caracteres)";
    }

    if (!formData.vc_email.trim()) {
      newErrors.vc_email = "El email es requerido";
    } else if (!validateEmail(formData.vc_email)) {
      newErrors.vc_email = "Email inválido";
    }

    if (!formData.vc_telefono.trim()) {
      newErrors.vc_telefono = "El teléfono es requerido";
    } else if (!validatePhone(formData.vc_telefono)) {
      newErrors.vc_telefono = "Teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Nuevo Cliente
                </h1>
                <p className="text-sm text-gray-500">
                  Completa la información del cliente
                </p>
              </div>
            </div>

            {/* Derecha: Botón Guardar */}
            <button
              type="submit"
              form="cliente-form"
              disabled={loading}
              className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Form - agregar id para conectar con el botón del topbar */}
        <form id="cliente-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Información Básica
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="vc_nombre"
                  value={formData.vc_nombre}
                  onChange={handleChange}
                  placeholder="Ej: Liverpool S.A. de C.V."
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                    errors.vc_nombre
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.vc_nombre && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {errors.vc_nombre}
                  </div>
                )}
              </div>

              {/* RFC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RFC
                </label>
                <input
                  type="text"
                  name="vc_rfc"
                  value={formData.vc_rfc}
                  onChange={handleChange}
                  placeholder="ABC123456XYZ"
                  maxLength={13}
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                    errors.vc_rfc
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.vc_rfc && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {errors.vc_rfc}
                  </div>
                )}
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="flex items-center h-[42px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="b_activo"
                      checked={formData.b_activo}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    <span className="ml-3 text-sm text-gray-700">
                      {formData.b_activo ? "Activo" : "Inactivo"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={20} className="text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Información de Contacto
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="vc_email"
                  value={formData.vc_email}
                  onChange={handleChange}
                  placeholder="contacto@empresa.com.mx"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                    errors.vc_email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.vc_email && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {errors.vc_email}
                  </div>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="vc_telefono"
                  value={formData.vc_telefono}
                  onChange={handleChange}
                  placeholder="+52 81 8888 9999"
                  className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
                    errors.vc_telefono
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.vc_telefono && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                    <AlertCircle size={14} />
                    {errors.vc_telefono}
                  </div>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="vc_direccion"
                  value={formData.vc_direccion}
                  onChange={handleChange}
                  placeholder="Av. Constitución 2211"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="vc_ciudad"
                  value={formData.vc_ciudad}
                  onChange={handleChange}
                  placeholder="Monterrey"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText size={20} className="text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Observaciones
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                name="vc_observaciones"
                value={formData.vc_observaciones}
                onChange={handleChange}
                rows={4}
                placeholder="Información adicional sobre el cliente..."
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>
        </form>
      </div>

      <MensajeConfirmacion
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="¿Deseas cancelar?"
        description="Se perderán los cambios no guardados."
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
