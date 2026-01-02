import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  FileText,
  Edit2,
  Users,
  Package,
  Store,
  Camera,
  TrendingUp,
  Clock,
  ChevronDown,
  CreditCard,
  Ticket,
} from "lucide-react";

import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"

import { ModalCustom } from '../../../components/ModalCustom'
import { getClientById } from '../../../Fetch/clientes';
import { registerUserInClient } from '../../../Fetch/usuarios';
import { clientDetail } from '../../../types/clients';
import { toast } from "sonner";
import { useAuthStore } from "../../../store/authStore";


// Tabs disponibles
const tabs = [
  { id: "info", label: "Información", icon: FileText },
  { id: "users", label: "Usuarios", icon: Users, count: 45 },
  { id: "stores", label: "Establecimientos", icon: Store, count: 12 },
  { id: "products", label: "Productos", icon: Package, count: 1250 },
  { id: "history", label: "Historial", icon: Clock },
];

export default function ClienteDetalle() {
    const { id } = useParams();
    
    const [activeTab, setActiveTab] = useState("info");
    const [imageHover, setImageHover] = useState(false);
    const [cliente, setCliente] = useState<clientDetail | null>(null);
    const [initials, setInitials] = useState("");

    useEffect(() => {
        console.log("Fetching client data...");

        const fetchingData = async() => {
            try{
                const data = await getClientById(id ? parseInt(id) : 0);

                const nameInitials = data.data.name
                    .split(" ")
                    .map((word: string) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                setInitials(nameInitials);
                setCliente(data.data);
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        };

        fetchingData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">

        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/clientes">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                    </Link>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                    Detalle del Cliente
                    </h1>
                    <p className="text-sm text-gray-500">
                    Información completa y gestión
                    </p>
                </div>
                </div>

                <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Edit2 size={16} />
                    Editar
                </button>
                {/*  TODO: esto cambiara a cambiar status
                <button className="px-4 py-2 text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                    <Trash2 size={16} />
                    Eliminar
                </button> */}
                </div>
            </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />

                <div className="px-6 pb-6 pt-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">
                        <div
                            className="relative"
                            onMouseEnter={() => setImageHover(true)}
                            onMouseLeave={() => setImageHover(false)}
                        >
                            <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                    <span className="text-4xl font-semibold text-white">
                                        {initials}
                                    </span>
                                </div>
                            </div>

                            {/* Overlay para subir foto */}
                            {imageHover && (
                                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center cursor-pointer transition-opacity">
                                    <div className="text-center text-white">
                                        <Camera size={24} className="mx-auto mb-1" />
                                        <span className="text-xs">Cambiar foto</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Name and Status */}
                        <div className="flex-1 md:mb-2 md:pt-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {cliente?.name}
                                </h2>
                                
                                {cliente?.i_status ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        Activo
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full">
                                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        Inactivo
                                    </span>
                                )}
                            </div>
                            
                            <p className="text-gray-500 mt-1">{cliente?.rfc}</p>
                        </div>

                        {/* Quick Stats */}
                        {/* <div className="flex gap-6 md:mb-2">
                            <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                                {cliente.users_count}
                            </p>
                            <p className="text-sm text-gray-500">Usuarios</p>
                            </div>
                            <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                                {cliente.stores_count}
                            </p>
                            <p className="text-sm text-gray-500">Establecimientos</p>
                            </div>
                            <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">
                                {cliente.products_count}
                            </p>
                            <p className="text-sm text-gray-500">Productos</p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    isActive
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${
                                        isActive
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "info" && <TabInfo cliente={cliente} />}
                    {activeTab === "users" && <TabUsers cliente={cliente} />}
                    {activeTab === "stores" && <TabStores />}
                    {activeTab === "products" && <TabProducts />}
                    {activeTab === "history" && <TabHistory />}
                </div>
            </div>
        </div>
        </div>
    );
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Tab: Información
function TabInfo({ cliente }: { cliente: clientDetail | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Información de Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail size={20} className="text-gray-400" />
            Información de Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{cliente?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Teléfono</p>
              <p className="font-medium text-gray-900">{cliente?.phone}</p>
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={20} className="text-gray-400" />
            Dirección
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Calle</p>
              <p className="font-medium text-gray-900">{cliente?.address}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Ciudad</p>
              <p className="font-medium text-gray-900">{cliente?.city}</p>
            </div>
            {/* <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Estado</p>
              <p className="font-medium text-gray-900">{cliente.state}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Código Postal</p>
              <p className="font-medium text-gray-900">{cliente.zip}</p>
            </div> */}
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-gray-400" />
            Observaciones
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 whitespace-pre-wrap">{cliente?.addiccional_notes}</p>
          </div>
        </div>
      </div>

      {/* Columna Lateral */}
      <div className="space-y-6">
        {/* Fechas */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            Fechas
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Fecha de registro</p>
              <p className="font-medium text-gray-900">
                {formatDate(cliente?.dt_register)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="font-medium text-gray-900">
                {formatDate(cliente?.dt_updated)}
              </p>
            </div>
          </div>
        </div>

        {/* Acceso Rápido */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-400" />
            Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <Users size={18} className="text-gray-400" />
              <span>Agregar Usuario</span>
            </button>
            <button className="w-full px-4 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <Store size={18} className="text-gray-400" />
              <span>Nuevo Establecimiento</span>
            </button>
            <button className="w-full px-4 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <Package size={18} className="text-gray-400" />
              <span>Asignar Productos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab: Usuarios (placeholder)
function TabUsers({cliente}: {cliente: clientDetail | null}) {
  const { user } = useAuthStore();
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const nombreRef = useRef<HTMLInputElement>(null);
  const apellidosRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);


  const handleSaveUser = async (): Promise<boolean> => {
    setIsLoadingModal(true);
    
    try {
      const userData = {
        name: nombreRef.current?.value || "",
        lastname: apellidosRef.current?.value || "",
        email: emailRef.current?.value || "",
        id_user_creator: user?.id_usuario || 0,
        id_client: cliente?.id_client || 0,
      };

      console.log("Saving user data:", userData);

      const response =  await registerUserInClient(userData);

      console.log("Response from registerUserInClient:", response);

      if (response.error) {
        toast.error('Error al agregar el usuario');
        return false;
      }

      toast.success('Usuario agregado exitosamente');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoadingModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Usuarios del Cliente
        </h3>

        <ModalCustom
          buttonTitle="Agregar Usuario"
          dialogTitle="Agregar Nuevo Usuario"
          dialogDescription="Complete el formulario para agregar un nuevo usuario al cliente."
          isLoading={isLoadingModal}
          onSubmit={handleSaveUser}
          body={
            <>
              {/* Formulario para agregar usuario */}
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input ref={nombreRef} id="nombre" name="nombre" defaultValue="" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="apellidos">apellidos</Label>
                  <Input ref={apellidosRef} id="apellidos" name="apellidos" defaultValue="" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Correo electronico</Label>
                  <Input ref={emailRef} type="email" id="email" name="email" defaultValue="" />
                </div>
              </div>
            </>
          }
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          {/* <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.status ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-red-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody> */}
        </table>
      </div>
    </div>
  );
}

// Tab: Establecimientos (placeholder)
function TabStores() {
  const stores = [
    { id: 1, name: "Sucursal Centro", address: "Av. Juárez 123", city: "Monterrey", status: true },
    { id: 2, name: "Sucursal Valle", address: "Av. Vasconcelos 456", city: "San Pedro", status: true },
    { id: 3, name: "Sucursal Cumbres", address: "Av. Lincoln 789", city: "Monterrey", status: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Establecimientos
        </h3>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Store size={16} />
          Nuevo Establecimiento
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div
            key={store.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Store size={20} className="text-gray-600" />
              </div>
              {store.status ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Activo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  Inactivo
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{store.name}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={14} />
              {store.address}, {store.city}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tab: Productos (placeholder)
function TabProducts() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Productos Asignados
        </h3>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Package size={16} />
          Asignar Productos
        </button>
      </div>

      {/* Placeholder */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package size={32} className="text-gray-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-1">
          Catálogo de Productos
        </h4>
        <p className="text-gray-500 max-w-md">
          Aquí se mostrará el DataTable con todos los productos asignados a este cliente.
        </p>
      </div>
    </div>
  );
}

// Tab: Historial con Acordeones
function TabHistory() {
  const [openAccordions, setOpenAccordions] = useState<string[]>(["cliente"]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const isOpen = (id: string) => openAccordions.includes(id);

  // Mock data de logs
  const logsCliente = [
    { id: 1, action: "Cliente creado", user: "Admin", date: "2024-01-15 10:30", detail: "Se registró el cliente en el sistema" },
    { id: 2, action: "Email actualizado", user: "Juan Pérez", date: "2024-03-20 14:15", detail: "Se cambió de info@liverpool.com a contacto@liverpool.com.mx" },
    { id: 3, action: "RFC actualizado", user: "María García", date: "2024-06-10 09:45", detail: "Se corrigió el RFC del cliente" },
    { id: 4, action: "Notas modificadas", user: "Admin", date: "2024-12-20 16:00", detail: "Se agregaron notas sobre crédito" },
  ];

  const logsUsuarios = [
    { id: 1, action: "Usuario creado", user: "Admin", date: "2024-01-15 11:00", detail: "Se creó usuario juan@liverpool.com" },
    { id: 2, action: "Rol modificado", user: "Admin", date: "2024-02-28 10:30", detail: "Juan Pérez cambió de Vendedor a Admin" },
    { id: 3, action: "Usuario desactivado", user: "Admin", date: "2024-08-15 14:00", detail: "Se desactivó usuario carlos@liverpool.com" },
  ];

  const logsEstablecimientos = [
    { id: 1, action: "Sucursal creada", user: "Admin", date: "2024-01-20 09:00", detail: "Se registró Sucursal Centro" },
    { id: 2, action: "Dirección actualizada", user: "María García", date: "2024-05-12 11:30", detail: "Se actualizó dirección de Sucursal Valle" },
  ];

  const logsProductos = [
    { id: 1, action: "Productos asignados", user: "Admin", date: "2024-02-01 10:00", detail: "Se asignaron 500 productos al catálogo" },
    { id: 2, action: "Precio actualizado", user: "Juan Pérez", date: "2024-07-15 16:45", detail: "Se actualizaron precios de 120 productos" },
  ];

  const logsTickets = [
    { id: 1, action: "Ticket creado", user: "Soporte", date: "2024-04-10 08:30", detail: "Ticket #1234 - Problema con facturación" },
    { id: 2, action: "Ticket resuelto", user: "Soporte", date: "2024-04-12 14:00", detail: "Ticket #1234 cerrado exitosamente" },
    { id: 3, action: "Ticket creado", user: "Soporte", date: "2024-11-05 10:15", detail: "Ticket #2456 - Solicitud de capacitación" },
  ];

  const logsPagos = [
    { id: 1, action: "Pago recibido", user: "Sistema", date: "2024-02-01 00:00", detail: "Pago mensual - $15,000 MXN" },
    { id: 2, action: "Pago recibido", user: "Sistema", date: "2024-03-01 00:00", detail: "Pago mensual - $15,000 MXN" },
    { id: 3, action: "Pago atrasado", user: "Sistema", date: "2024-04-05 00:00", detail: "Recordatorio enviado - Factura pendiente" },
    { id: 4, action: "Pago recibido", user: "Sistema", date: "2024-04-10 09:30", detail: "Pago mensual - $15,000 MXN (con retraso)" },
  ];

  const accordions = [
    { id: "cliente", label: "Cliente", icon: Building2, logs: logsCliente, color: "bg-gray-100 text-gray-600" },
    { id: "usuarios", label: "Usuarios", icon: Users, logs: logsUsuarios, color: "bg-blue-50 text-blue-600" },
    { id: "establecimientos", label: "Establecimientos", icon: Store, logs: logsEstablecimientos, color: "bg-purple-50 text-purple-600" },
    { id: "productos", label: "Productos", icon: Package, logs: logsProductos, color: "bg-orange-50 text-orange-600" },
    { id: "tickets", label: "Tickets", icon: Ticket, logs: logsTickets, color: "bg-yellow-50 text-yellow-600" },
    { id: "pagos", label: "Pagos", icon: CreditCard, logs: logsPagos, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Cambios
        </h3>
        <p className="text-sm text-gray-500">
          Registro de todas las actividades
        </p>
      </div>

      {/* Acordeones */}
      <div className="space-y-3">
        {accordions.map((accordion) => {
          const Icon = accordion.icon;
          const open = isOpen(accordion.id);

          return (
            <div
              key={accordion.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header del Acordeón */}
              <button
                onClick={() => toggleAccordion(accordion.id)}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accordion.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-medium text-gray-900">
                    {accordion.label}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {accordion.logs.length} registros
                  </span>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Contenido del Acordeón */}
              {open && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-4">
                    {/* Timeline */}
                    <div className="relative">
                      {accordion.logs.map((log, index) => (
                        <div key={log.id} className="flex gap-4 pb-4 last:pb-0">
                          {/* Línea de timeline */}
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm" />
                            {index < accordion.logs.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                            )}
                          </div>

                          {/* Contenido del log */}
                          <div className="flex-1 pb-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-medium text-gray-900">
                                  {log.action}
                                </p>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {log.date}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {log.detail}
                              </p>
                              <p className="text-xs text-gray-400">
                                Por: {log.user}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}