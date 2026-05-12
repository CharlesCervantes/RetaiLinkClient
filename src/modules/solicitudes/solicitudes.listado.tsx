import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Loader2, MoreHorizontal, Eye, Edit2, ClipboardList } from "lucide-react"


import { api, ApiResponse } from '@/lib'
import { RequestDTO } from '@/dtos'
import { useAuthStore } from "@/stores";
import { getCLientsList } from "@/Fetch/clientes";
// import { getRequestsByClient, RequestData } from "@/Fetch/solicitudes";
import { Button, DataTable, PageHeader, PageWrapper, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components"


export function SolicitudesList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Validamos si es super admin
  const isSuperAdmin = user?.id_client === 0 || user?.i_rol === 1;

  // Estados
  const [solicitudes, setSolicitudes] = useState<RequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el selector de clientes (Super Admin)
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // --- EFECTO 1: Cargar Clientes (Solo Super Admin) ---
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchClients = async () => {
        setLoadingClientes(true);
        try {
          const response = await getCLientsList();
          const clientsList = response.data || [];
          setClientes(clientsList);
          
          if (clientsList.length > 0) {
            setSelectedClientId(clientsList[0].id_client);
          }
        } catch (error) {
          console.error("Error al cargar clientes:", error);
        } finally {
          setLoadingClientes(false);
        }
      };
      fetchClients();
    } else {
      setSelectedClientId(user?.id_client || null);
    }
  }, [isSuperAdmin, user]);

  // --- EFECTO 2: Cargar Solicitudes del Cliente Seleccionado ---
  useEffect(() => {
    if (!selectedClientId) return;

    const fetchSolicitudes = async () => {
      setLoading(true);
      try {
        const res = await api.get<ApiResponse<{ data: RequestDTO[]; meta: any }>>(`/requests?${new URLSearchParams({ id_client: selectedClientId.toString() })}`);
        if (res.ok && res.data?.data) {
          setSolicitudes(res.data.data);
        } else {
          setSolicitudes([]);
        }
      } catch (error) {
        console.error("Error cargando solicitudes", error);
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [selectedClientId]);

  const handleClientChange = (value: string) => {
    setSelectedClientId(Number(value));
  };

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns: ColumnDef<RequestDTO>[] = [
    {
      accessorKey: "vc_name",
      header: "Nombre de la Solicitud",
      cell: ({ row }) => (
        <span
          className="font-medium cursor-pointer hover:underline text-blue-600"
          onClick={() => navigate(`/detalle-solicitud/${row.original.id_request}`)}
        >
          {row.getValue("vc_name")}
        </span>
      ),
    },
    {
      accessorKey: "dt_register",
      header: "Fecha de Registro",
      cell: ({ row }) => {
        const fecha = new Date(row.original.dt_register);
        return fecha.toLocaleDateString("es-MX", { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      },
    },
    {
      accessorKey: "f_value",
      header: "Total ($)",
      cell: ({ row }) => {
        const total = Number(row.original.f_value);
        return <span className="font-semibold">${total.toFixed(2)} MXN</span>;
      },
    },
    // --- NUEVA COLUMNA DE ACCIONES ---
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const id = row.original.id_request;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => navigate(`/detalle-solicitud/${id}`)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                <span>Ver Detalle</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => navigate(`/editar-solicitud/${id}`)}
                className="cursor-pointer"
              >
                <Edit2 className="mr-2 h-4 w-4 text-amber-600" />
                <span>Editar Solicitud</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isSuperAdmin && loadingClientes) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-secondary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Cargando clientes...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Solicitudes"
        subtitle="Listado de solicitudes generadas para revisión en campo"
        icon={ClipboardList}
        actions={
          <Button onClick={() => navigate("/crearSolicitud")} className="flex items-center gap-2">
            <Plus size={16} /> Nueva solicitud
          </Button>
        }
      />

      {isSuperAdmin && clientes.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
          <label className="text-sm font-medium flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
            Cliente:
          </label>
          <Select value={selectedClientId?.toString() || ""} onValueChange={handleClientChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((client) => (
                <SelectItem key={client.id_client} value={client.id_client.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
          <DataTable
            columns={columns}
            data={solicitudes}
            isLoading={loading}
            emptyMessage={
              isSuperAdmin && !selectedClientId 
                ? "Selecciona un cliente para ver sus solicitudes." 
                : "No hay solicitudes aún. Crea la primera."
            }
            pagination={{
              showPageSizeSelector: true,
              showPageNavigation: true,
              showSelectedCount: false,
              pageSize: 10,
            }}
            responsive={{
              enabled: true,
            }}
          />
      </div>
    </PageWrapper>
  );
}