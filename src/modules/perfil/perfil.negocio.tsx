import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { Building2, Mail, MapPin, FileText, Users, Package, Store, Clock, TrendingUp, ChevronDown, CreditCard, Ticket, Loader2, Phone } from "lucide-react"


import { useAuthStore } from "@/stores"
import { clientDetail } from "@/types/clients"
import { getClientById } from "@/Fetch/clientes"
import { registerUserInClient } from "@/Fetch/usuarios"
import { PageWrapper, ModalCustom, Input, Label } from "@/components"


const tabs = [
  { id: "info", label: "Información", icon: FileText },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "stores", label: "Establecimientos", icon: Store },
  { id: "products", label: "Productos", icon: Package },
  { id: "history", label: "Historial", icon: Clock },
];


const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getInitials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();


export function MiNegocio() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("info");
  const [cliente, setCliente] = useState<clientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id_client) return;
    getClientById(user.id_client)
      .then((res) => setCliente(res.data))
      .catch(() => toast.error("Error al cargar la información del negocio"))
      .finally(() => setLoading(false));
  }, [user?.id_client]);

  if (loading)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Cargando...</span>
        </div>
      </PageWrapper>
    );

  if (!cliente)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20 text-sm" style={{ color: "var(--text-secondary)" }}>
          No se encontró información del negocio.
        </div>
      </PageWrapper>
    );

  return (
    <div className="min-h-full" style={{ backgroundColor: "var(--bg)" }}>

      {/* Header fijo */}
      <div className="sticky top-0 z-10 border-b px-6 py-4" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Mi Negocio</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Información y gestión de tu empresa</p>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Tarjeta principal */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />

          <div className="px-6 pb-6 pt-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16">

              {/* Avatar */}
              <div className="w-32 h-32 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-white">
                    {getInitials(cliente.name)}
                  </span>
                </div>
              </div>

              {/* Nombre + estado */}
              <div className="flex-1 md:mb-2 md:pt-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{cliente.name}</h2>
                  {cliente.i_status ? (
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
                <p className="text-gray-500 mt-1">{cliente.rfc || "Sin RFC registrado"}</p>
              </div>
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
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "info"     && <TabInfo cliente={cliente} />}
            {activeTab === "users"    && <TabUsers cliente={cliente} />}
            {activeTab === "stores"   && <TabStores />}
            {activeTab === "products" && <TabProducts />}
            {activeTab === "history"  && <TabHistory />}
          </div>
        </div>
      </div>
    </div>
  );
}


function TabInfo({ cliente }: { cliente: clientDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">

        {/* Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail size={18} className="text-gray-400" />
            Información de Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">{cliente.email || "—"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Teléfono</p>
              <p className="font-medium text-gray-900">{cliente.phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={18} className="text-gray-400" />
            Dirección
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Calle</p>
              <p className="font-medium text-gray-900">{cliente.address || "—"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Ciudad</p>
              <p className="font-medium text-gray-900">{cliente.city || "—"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Estado</p>
              <p className="font-medium text-gray-900">{cliente.state || "—"}</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        {cliente.addiccional_notes && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              Observaciones
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{cliente.addiccional_notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            Fechas
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Registrado</p>
              <p className="font-medium text-gray-900">{formatDate(cliente.dt_register)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Última actualización</p>
              <p className="font-medium text-gray-900">{formatDate(cliente.dt_updated)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" />
            Acciones Rápidas
          </h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
              <Store size={16} className="text-gray-400" />
              <span className="text-sm">Ver Establecimientos</span>
            </button>
            <button className="w-full px-4 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
              <Package size={16} className="text-gray-400" />
              <span className="text-sm">Ver Productos</span>
            </button>
            <button className="w-full px-4 py-2.5 text-left text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
              <Phone size={16} className="text-gray-400" />
              <span className="text-sm">Contactar Soporte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabUsers({ cliente }: { cliente: clientDetail }) {
  const { user } = useAuthStore();
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const nombreRef  = useRef<HTMLInputElement>(null);
  const apellidoRef = useRef<HTMLInputElement>(null);
  const emailRef   = useRef<HTMLInputElement>(null);

  const handleSaveUser = async (): Promise<boolean> => {
    setIsLoadingModal(true);
    try {
      const res = await registerUserInClient({
        name: nombreRef.current?.value || "",
        lastname: apellidoRef.current?.value || "",
        email: emailRef.current?.value || "",
        id_user_creator: user?.id_user || 0,
        id_client: cliente.id_client,
        password: "",
        i_rol: 0
      });
      if (res?.error) { toast.error("Error al agregar el usuario"); return false; }
      toast.success("Usuario agregado exitosamente");
      return true;
    } catch {
      toast.error("Error al agregar el usuario");
      return false;
    } finally {
      setIsLoadingModal(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Usuarios del negocio</h3>
        <ModalCustom
          buttonTitle="Agregar Usuario"
          dialogTitle="Agregar Nuevo Usuario"
          dialogDescription="Completa el formulario para invitar a un nuevo usuario."
          isLoading={isLoadingModal}
          onSubmit={handleSaveUser}
          body={
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mn-nombre">Nombre</Label>
                <Input ref={nombreRef} id="mn-nombre" placeholder="Nombre" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mn-apellido">Apellido</Label>
                <Input ref={apellidoRef} id="mn-apellido" placeholder="Apellido" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mn-email">Correo electrónico</Label>
                <Input ref={emailRef} id="mn-email" type="email" placeholder="correo@ejemplo.com" />
              </div>
            </div>
          }
        />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">
                Los usuarios se cargarán al conectar el endpoint.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabStores() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Establecimientos</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Store size={28} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">
          Ve a la sección <span className="font-semibold text-gray-700">Establecimientos</span> para gestionar tus sucursales.
        </p>
      </div>
    </div>
  );
}

function TabProducts() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Productos Asignados</h3>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Package size={28} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">
          Ve a la sección <span className="font-semibold text-gray-700">Productos</span> para ver el catálogo completo.
        </p>
      </div>
    </div>
  );
}

function TabHistory() {
  const [openAccordions, setOpenAccordions] = useState<string[]>(["negocio"]);

  const toggle = (id: string) =>
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const accordions = [
    {
      id: "negocio",
      label: "Negocio",
      icon: Building2,
      color: "bg-gray-100 text-gray-600",
      logs: [
        { id: 1, action: "Negocio registrado", user: "SuperAdmin", date: "2024-01-15 10:30", detail: "Se registró el negocio en la plataforma." },
      ],
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      logs: [
        { id: 1, action: "Usuario creado", user: "Admin", date: "2024-01-15 11:00", detail: "Se creó el primer usuario administrador." },
      ],
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      color: "bg-yellow-50 text-yellow-600",
      logs: [],
    },
    {
      id: "pagos",
      label: "Pagos",
      icon: CreditCard,
      color: "bg-green-50 text-green-600",
      logs: [],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Actividad</h3>
        <p className="text-sm text-gray-400">Registro de cambios en tu negocio</p>
      </div>

      <div className="space-y-3">
        {accordions.map((accordion) => {
          const Icon = accordion.icon;
          const open = openAccordions.includes(accordion.id);
          return (
            <div key={accordion.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(accordion.id)}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accordion.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-medium text-gray-900">{accordion.label}</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {accordion.logs.length} registros
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>

              {open && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {accordion.logs.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Sin registros aún.</p>
                  ) : (
                    <div className="space-y-3">
                      {accordion.logs.map((log, idx) => (
                        <div key={log.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white shadow-sm mt-1" />
                            {idx < accordion.logs.length - 1 && (
                              <div className="w-px flex-1 bg-gray-200 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-medium text-gray-900 text-sm">{log.action}</p>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{log.date}</span>
                              </div>
                              <p className="text-sm text-gray-500">{log.detail}</p>
                              <p className="text-xs text-gray-400 mt-1">Por: {log.user}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
