import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, Eye, Receipt } from "lucide-react"


import { useAuthStore } from "@/stores"
import { getCLientsList } from "@/Fetch/clientes"
import { getOrdersByClient, OrderData } from "@/Fetch/pedidos"
import { Button, DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, PageHeader, PageWrapper } from "@/components"


export function PedidosList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const isSuperAdmin = user?.id_client === 0 || user?.i_rol === 1;

  const [pedidos, setPedidos] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  useEffect(() => {
    if (isSuperAdmin) {
      getCLientsList().then(res => {
        const clients = res.data || [];
        setClientes(clients);
        if (clients.length > 0) setSelectedClientId(clients[0].id_client);
      });
    } else {
      setSelectedClientId(user?.id_client || null);
    }
  }, [isSuperAdmin, user]);

  useEffect(() => {
    if (!selectedClientId) return;
    setLoading(true);
    getOrdersByClient(selectedClientId)
      .then(res => setPedidos(res.data || []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  }, [selectedClientId]);

  const columns: ColumnDef<OrderData>[] = [
    {
      accessorKey: "id_order",
      header: "ID Pedido",
      cell: ({ row }) => <span className="font-bold text-gray-700">#{row.getValue("id_order")}</span>,
    },
    {
      accessorKey: "request_name",
      header: "Solicitud Base (Template)",
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/detalle-pedido/${row.original.id_order}`)}>
          {row.getValue("request_name")}
        </span>
      ),
    },
    {
      accessorKey: "total_tasks",
      header: "Tiendas a visitar",
      cell: ({ row }) => <span className="bg-gray-100 px-2 py-1 rounded font-medium">{row.getValue("total_tasks")} Tareas</span>,
    },
    {
      accessorKey: "f_total",
      header: "Costo Total",
      cell: ({ row }) => <span className="font-semibold text-green-600">${Number(row.getValue("f_total")).toFixed(2)}</span>,
    },
    {
      accessorKey: "dt_register",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.dt_register).toLocaleDateString("es-MX"),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/detalle-pedido/${row.original.id_order}`)}>
          <Eye className="w-4 h-4 mr-2" /> Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Pedidos de Operación"
        subtitle="Órdenes generadas que contienen tareas para los promotores"
        icon={Receipt}
        actions={
          <Button onClick={() => navigate("/crearPedido")} className="flex items-center gap-2">
            <Plus size={16} /> Crear Pedido
          </Button>
        }
      />

      {isSuperAdmin && clientes.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
          <label className="text-sm font-medium flex-shrink-0" style={{ color: "var(--text-secondary)" }}>Cliente:</label>
          <Select value={selectedClientId?.toString() || ""} onValueChange={(val) => setSelectedClientId(Number(val))}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
            <SelectContent>
              {clientes.map((c) => <SelectItem key={c.id_client} value={c.id_client.toString()}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
        <DataTable
          columns={columns}
          data={pedidos}
          isLoading={loading}
          emptyMessage="No hay pedidos registrados para este cliente."
        />
      </div>
    </PageWrapper>
  );
}