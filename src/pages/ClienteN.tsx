import React, { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  FileText,
  Save,
  X,
  AlertCircle,
} from "lucide-react";

export default function NuevoCliente() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  // Formatear RFC mexicano (solo mayúsculas y sin espacios)
  const formatRFC = (value) => {
    // Convertir a mayúsculas y eliminar espacios y caracteres especiales
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 13);
  };

  // Validar RFC mexicano
  const validateRFC = (rfc) => {
    // RFC persona moral: 12 caracteres (3 letras + 6 números fecha + 3 alfanuméricos)
    // RFC persona física: 13 caracteres (4 letras + 6 números fecha + 3 alfanuméricos)
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcPattern.test(rfc) && (rfc.length === 12 || rfc.length === 13);
  };

  // Validar email
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validar teléfono mexicano
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/[\s()-+]/g, "");
    // Acepta números de 10 dígitos o +52 seguido de 10 dígitos
    return /^(\+?52)?[0-9]{10}$/.test(cleaned);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue = type === "checkbox" ? checked : value;

    // Formatear RFC automáticamente
    if (name === "vc_rfc") {
      finalValue = formatRFC(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Nombre requerido
    if (!formData.vc_nombre.trim()) {
      newErrors.vc_nombre = "El nombre es requerido";
    }

    // RFC requerido y válido
    if (!formData.vc_rfc.trim()) {
      newErrors.vc_rfc = "El RFC es requerido";
    } else if (!validateRFC(formData.vc_rfc)) {
      newErrors.vc_rfc = "RFC inválido (12-13 caracteres)";
    }

    // Email requerido y válido
    if (!formData.vc_email.trim()) {
      newErrors.vc_email = "El email es requerido";
    } else if (!validateEmail(formData.vc_email)) {
      newErrors.vc_email = "Email inválido";
    }

    // Teléfono requerido y válido
    if (!formData.vc_telefono.trim()) {
      newErrors.vc_telefono = "El teléfono es requerido";
    } else if (!validatePhone(formData.vc_telefono)) {
      newErrors.vc_telefono = "Teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Cliente creado:", formData);
      alert("Cliente creado exitosamente");

      // Aquí irías a la página de clientes
      // navigate('/clientes');
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("¿Deseas cancelar? Se perderán los cambios.")) {
      // navigate('/clientes');
      console.log("Cancelado");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Nuevo Cliente
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Completa la información del cliente
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  RFC *
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

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 bg-white rounded-lg border border-gray-200 p-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <X size={18} />
              Cancelar
            </button>
            <button
              type="submit"
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
                  Guardar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
