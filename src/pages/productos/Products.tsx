// pages/admin/products/Products.tsx
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Package, Plus, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DataTable } from "../../components";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { getProductsByClient, deleteProduct } from "../../Fetch/products";
import { getCLientsList } from "../../Fetch/clientes";
import { useAuthStore } from "../../store/authStore";

interface Product {
  id_product: number;
  name: string;
  description: string | null;
  i_status: number;
  dt_created: string;
  dt_updated: string;
}

interface Client {
  id_client: number;
  name: string;
}

export default function ProductPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const isSuperAdmin = user?.i_rol === 1;

  // Cargar clientes si es superadmin
  useEffect(() => {
    if (isSuperAdmin) {
      fetchClients();
    } else {
      // Si no es superadmin, usar el id_client del usuario
      setSelectedClientId(user?.id_client || null);
    }
  }, [isSuperAdmin, user]);

  // Cargar productos cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClientId) {
      fetchProducts(selectedClientId);
    }
  }, [selectedClientId]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await getCLientsList();
      const clientsList = response.data || [];
      setClients(clientsList);
      
      // Seleccionar el primer cliente por defecto
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
      const response = await getProductsByClient(clientId);
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

  const stats = useMemo(
    () => ({
      total: products.length,
      activos: products.filter((p) => p.i_status === 1).length,
      inactivos: products.filter((p) => p.i_status === 0).length,
    }),
    [products]
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (id_product: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await deleteProduct(id_product);
      toast.success("Producto eliminado exitosamente");
      if (selectedClientId) {
        fetchProducts(selectedClientId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar producto");
    }
  };

  const columns: ColumnDef<Product>[] = [
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

  // Loading inicial para superadmin cargando clientes
  if (isSuperAdmin && loadingClients) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-gray-400" />
          <p className="text-gray-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra los productos del cliente
            </p>
          </div>
          <Link to="/producto" state={{ id_client: selectedClientId }}>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Nuevo Producto
            </Button>
          </Link>
        </div>

        {/* Select de clientes (solo para superadmin) */}
        {isSuperAdmin && clients.length > 0 && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Cliente:
              </label>
              <Select
                value={selectedClientId?.toString() || ""}
                onValueChange={handleClientChange}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id_client}
                      value={client.id_client.toString()}
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Activos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.activos}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Inactivos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.inactivos}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* DataTable */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {products.length > 0 ? (
                <DataTable columns={columns} data={products} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">
                    Sin productos
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Aún no hay productos registrados para este cliente.
                  </p>
                  <Link to="/producto" state={{ id_client: selectedClientId }}>
                    <Button>
                      <Plus size={16} className="mr-2" />
                      Agregar primer producto
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}