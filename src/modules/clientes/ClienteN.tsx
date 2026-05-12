import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Mail, FileText, Save, AlertCircle,} from "lucide-react";


import { ApiResponse, api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ClientDTO, CountryDTO, StateDTO, CityDTO } from "@/dtos";
import { Input, MensajeConfirmacion, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components";



type FormErrors = { [key: string]: string | null;};
export default function NuevoCliente() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [paises, setPaises] = useState<CountryDTO[]>([]);
  const [estados, setEstados] = useState<StateDTO[]>([]);
  const [ciudades, setCiudades] = useState<CityDTO[]>([]);
  
  const [formData, setFormData] = useState({
    vc_nombre: "",
    vc_rfc: "",
    vc_email: "",
    vc_telefono: "",
    id_pais: "",
    id_estado: "",
    id_ciudad: "",
    vc_calle: "",
    vc_num_ext: "",
    vc_num_int: "",
    vc_colonia: "",
    vc_cp: "",
    vc_observaciones: "",
    b_activo: true,
  });

  const haveData = Boolean(
    formData.vc_nombre.trim() ||
    formData.vc_rfc.trim() ||
    formData.vc_email.trim() ||
    formData.vc_telefono.trim() ||
    formData.vc_calle.trim() ||
    formData.vc_num_ext.trim() ||
    formData.vc_num_int.trim() ||
    formData.vc_colonia.trim() ||
    formData.vc_cp.trim() ||
    formData.vc_observaciones.trim()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    let finalValue: string | boolean = type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value;

    if (name === "vc_rfc") {
      finalValue = formatRFC(value);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null, }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const request = await api.post<ApiResponse<ClientDTO>>('/clients', {
        id_user: user?.id_user,
        name: formData.vc_nombre,
        rfc: formData.vc_rfc || undefined,
        email: formData.vc_email,
        phone: formData.vc_telefono || undefined,
        id_pais: formData.id_pais ? Number(formData.id_pais) : undefined,
        id_estado: formData.id_estado ? Number(formData.id_estado) : undefined,
        id_ciudad: formData.id_ciudad ? Number(formData.id_ciudad) : undefined,
        street: formData.vc_calle || undefined,
        ext_number: formData.vc_num_ext || undefined,
        int_number: formData.vc_num_int || undefined,
        neighborhood: formData.vc_colonia.trim().toLowerCase() || undefined,
        zip: formData.vc_cp || undefined,
        addiccional_notes: formData.vc_observaciones || undefined,
      });

      const clienteId: number = request.data.id_client;
      if (documentoFile) {
        const formDataDoc = new FormData();
        formDataDoc.append('file', documentoFile);
        const uploadRes = await api.upload<ApiResponse<{ url: string }>>(`/clients/${clienteId}/docs`,formDataDoc);
        console.log("URL del documento:", uploadRes.data.url);
      }

      toast.success("Cliente creado exitosamente");

      navigate(`/clientes/${clienteId}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear cliente");
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

  useEffect(() => {
    const fetchPaises = async () => {
      const request = await api.get<ApiResponse<CountryDTO[]>>('/clients/countries');
      const data: CountryDTO[] = request.data || [];
      setPaises(data);

    };

    fetchPaises();
  }, []);

  useEffect(() => {
    if (!formData.id_pais) return;

    const fetchEstados = async () => {
      setEstados([]);
      setCiudades([]);
      setFormData((prev) => ({ ...prev, id_estado: "", id_ciudad: "" }));
      const request = await api.get<ApiResponse<StateDTO[]>>(`/clients/states/${formData.id_pais}`);
      const data: StateDTO[] = request.data || [];
      setEstados(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, id_estado: String(data[0].id) }));
      }
    };

    fetchEstados();
  }, [formData.id_pais]);


  useEffect(() => {
    if (!formData.id_pais || !formData.id_estado) return;
    const fetchCiudades = async () => {
      setCiudades([]);
      setFormData((prev) => ({ ...prev, id_ciudad: "" }));
      const request = await api.get<ApiResponse<CityDTO[]>>(`/clients/cities/${formData.id_estado}`);
      const data: CityDTO[] = request.data || [];
      setCiudades(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, id_ciudad: String(data[0].id) }));
      }
    };

    fetchCiudades();
  }, [formData.id_estado]);


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


              {/* Documento situacion fiscal:  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento: carta de situacion fiscal 
                </label>
                <Input
                  type="file"
                  accept=".pdf,.xml"
                  onChange={(e) => setDocumentoFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer"
                />
                {documentoFile && (
                  <p className="mt-1 text-sm text-gray-500 truncate">{documentoFile.name}</p>
                )}
              </div>

              {/* Email: TODO: agregar la nota que este correo sera donde lleguen todas las notificaciones (factuaracion, etc) debe ser el oficial */}
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
                <span>Este correo llegaran las notificaciones del sistema</span>
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
                  placeholder="8188889999"
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
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Mail size={20} className="text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">
                Direccion
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <Select
                  value={formData.id_pais}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, id_pais: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {paises.map((pais) => (
                      <SelectItem key={pais.id} value={String(pais.id)}>
                        {pais.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <Select
                  value={formData.id_estado}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, id_estado: value }))
                  }
                  disabled={estados.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={String(estado.id)}>
                        {estado.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <Select
                  value={formData.id_ciudad}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, id_ciudad: value }))
                  }
                  disabled={ciudades.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ciudades.map((ciudad) => (
                      <SelectItem key={ciudad.id} value={String(ciudad.id)}>
                        {ciudad.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Colonia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colonia
                </label>
                <input
                  type="text"
                  name="vc_colonia"
                  value={formData.vc_colonia}
                  onChange={handleChange}
                  placeholder="Col. Centro"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>

              {/* Calle */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calle
                </label>
                <input
                  type="text"
                  name="vc_calle"
                  value={formData.vc_calle}
                  onChange={handleChange}
                  placeholder="Av. Constitución"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>

              {/* Número exterior */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número exterior
                </label>
                <input
                  type="text"
                  name="vc_num_ext"
                  value={formData.vc_num_ext}
                  onChange={handleChange}
                  placeholder="2211"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>

              {/* Número interior */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número interior
                </label>
                <input
                  type="text"
                  name="vc_num_int"
                  value={formData.vc_num_int}
                  onChange={handleChange}
                  placeholder="Piso 3, Depto B"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                />
              </div>

              {/* Código postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código postal
                </label>
                <input
                  type="text"
                  name="vc_cp"
                  value={formData.vc_cp}
                  onChange={handleChange}
                  placeholder="64000"
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
