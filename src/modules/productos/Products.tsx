import { toast } from "sonner"
import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, Package, Plus, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react"


import { useAuthStore } from '@/stores';
import { ProductDTO, ClientDTO } from "@/dtos";
import { api, ApiResponse, formatDate } from '@/lib'
import { Button, DataTable, PageWrapper, PageHeader, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components';


export default function ProductPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();


  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);


  const isSuperAdmin = user?.i_rol === 1;


  useEffect(() => {
    if (isSuperAdmin) {
      fetchClients();
    } else {
      setSelectedClientId(user?.id_client || null);
    }
  }, [isSuperAdmin, user]);

  useEffect(() => {
    if (selectedClientId) {
      fetchProducts(selectedClientId);
    } else {
      setLoading(false);
      setProducts([]);
      setError(null);
    }
  }, [selectedClientId]);



  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await api.get<ApiResponse<ClientDTO[]>>(`/clients`);
      const clientsList = response.data || [];
      setClients(clientsList);
      
      if (clientsList.length > 0) {
        setSelectedClientId(clientsList[0].id_client);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast.error("Error al cargar los clientes");
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchProducts = async (clientId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse<ProductDTO[]>>(`/products/${clientId}`);
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (value: string) => {
    setSelectedClientId(Number(value));
  };


  const handleDelete = async (id_product: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await api.delete<ApiResponse>(`/products/${id_product}`);
      toast.success("Producto eliminado exitosamente");
      if (selectedClientId) {
        fetchProducts(selectedClientId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar producto");
    }
  };

  const columns: ColumnDef<ProductDTO>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        return (
          <div className="text-gray-500 max-w-xs truncate">
            {description || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "i_status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("i_status") as number;
        return status === 1 ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-sm rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-sm rounded-full">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Inactivo
          </span>
        );
      },
    },
    {
      accessorKey: "dt_created",
      header: "Fecha de registro",
      cell: ({ row }) => (
        <div className="text-gray-500">
          {formatDate(row.getValue("dt_created"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/producto/detalle/${product.id_product}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/producto/${product.id_product}`)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(product.id_product)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isSuperAdmin && loadingClients) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-secondary)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Cargando clientes...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Productos"
        subtitle="Administra los productos del cliente"
        icon={Package}
        actions={
          <Link to="/producto" state={{ id_client: selectedClientId }}>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Nuevo Producto
            </Button>
          </Link>
        }
      />

      {isSuperAdmin && clients.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
          <label className="text-sm font-medium flex-shrink-0" style={{ color: "var(--text-secondary)" }}>Cliente:</label>
          <Select value={selectedClientId?.toString() || ""} onValueChange={handleClientChange}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id_client} value={client.id_client.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
        <DataTable
          columns={columns}
          data={products}
          isLoading={loading}
          emptyMessage="No hay productos registrados."
        />
      </div>
    </PageWrapper>
  );
}