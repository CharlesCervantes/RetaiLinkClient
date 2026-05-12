import { ColumnDef } from "@tanstack/react-table";
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Users, Mail, Phone, Eye, Trash2, MoreVertical, Plus, Loader2 } from "lucide-react";

import { ClientListDTO } from "@/dtos"
import { api, ApiResponse } from '@/lib'
import { ConfirmModal, DataTable, DataTableColumnHeader, FilterConfig, Button, PageWrapper, PageHeader, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components";


export default function ClientesPage() {
  const navigate = useNavigate();


  const [clientes, setClientes] = useState<ClientListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; cliente: ClientListDTO | null; loading: boolean }>({
    open: false,
    cliente: null,
    loading: false,
  });


  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<ApiResponse<ClientListDTO[]>>('/clients');
        setClientes(res.data);
      } catch (err) {
        console.error("Error cargando clientes:", err);
        setError("Error al cargar los clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);


  const handleView = (cliente: ClientListDTO) => {
    navigate(`/clientes/${cliente.id_client}`);
  };
  const handleDelete = (cliente: ClientListDTO) => {
    setDeleteModal({ open: true, cliente, loading: false });
  };
  const handleConfirmDelete = async () => {
    if (!deleteModal.cliente) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await api.delete(`/clients/${deleteModal.cliente.id_client}`);
      setClientes((prev) => prev.filter((c) => c.id_client !== deleteModal.cliente!.id_client));
      handleCloseDeleteModal();
    } catch {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };
  const handleCloseDeleteModal = () => {
    setDeleteModal({ open: false, cliente: null, loading: false });
    setTimeout(() => {
      document.body.style.pointerEvents = "";
    }, 100);
  };


  const columns = useMemo<ColumnDef<ClientListDTO>[]>(
    () => [
      // Columna: Cliente (nombre + RFC)
      {
        accessorKey: "vc_nombre",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Cliente" />
        ),
        cell: ({ row }) => {
          const cliente = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium flex-shrink-0">
                {cliente.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {cliente.name}
                </p>
                <p className="text-sm text-gray-500">{cliente.rfc}</p>
              </div>
            </div>
          );
        },
        enableHiding: false,
      },
      // Columna: Contacto (email + teléfono)
      {
        accessorKey: "vc_email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Contacto" />
        ),
        cell: ({ row }) => {
          const cliente = row.original;
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{cliente.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span>{cliente.phone}</span>
              </div>
            </div>
          );
        },
      },
      // Columna: Usuarios
      {
        accessorKey: "i_cant_usuarios",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Usuarios" />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
            <Users size={14} />
            {row.original.i_cant_usuarios}
          </span>
        ),
      },
      // Columna: Estado
      {
        accessorKey: "b_activo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" />
        ),
        cell: ({ row }) => {
          const activo = row.original.i_status === 1;
          return activo ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-sm rounded-md">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-sm rounded-md">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Inactivo
            </span>
          );
        },
        // Función de filtro personalizada para booleanos
        filterFn: (row, id, value) => {
          if (value === "" || value === null) return true;
          return row.getValue(id) === (value === "true");
        },
      },
      // Columna: Fecha de creación
      {
        accessorKey: "dt_creacion",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Fecha Registro" />
        ),
        cell: ({ row }) => {
          const fecha = new Date(row.original.dt_register);
          return (
            <span className="text-sm text-gray-600">
              {fecha.toLocaleDateString("es-MX", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          );
        },
      },
      // Columna: Acciones
      {
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => {
          const cliente = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleView(cliente)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => handleEdit(cliente)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(cliente)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );
  const filtersConfig: FilterConfig[] = [
    {
      id: "vc_nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Buscar por nombre...",
    },
    {
      id: "b_activo",
      label: "Estado",
      type: "boolean",
      placeholder: "Todos",
      options: [
        { label: "Activo", value: "true" },
        { label: "Inactivo", value: "false" },
      ],
    },
  ];


  return (
    <PageWrapper>
      <PageHeader
        title="Clientes"
        subtitle="Administra los clientes del sistema"
        icon={Building2}
        actions={
          <Link to="/crearCliente">
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Nuevo Cliente
            </Button>
          </Link>
        }
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--text-secondary)" }} />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <DataTable<ClientListDTO>
              columns={columns}
              data={clientes}
              filters={{
                filters: filtersConfig,
                showClearButton: true,
                layout: "inline",
                debounceMs: 300,
              }}
              pagination={{
                mode: "client",
                pageSize: 10,
                pageSizeOptions: [5, 10, 20, 50],
                showPageSizeSelector: true,
                showSelectedCount: true,
                showPageNavigation: true,
              }}
              export={{
                enableExcel: true,
                fileName: "clientes",
                sheetName: "Clientes",
              }}
              responsive={{
                enabled: true,
                minColumnWidth: 150,
                priorityColumns: ["vc_nombre", "b_activo"],
              }}
              rowSelection={{
                enabled: true,
                mode: "multiple",
                onSelectionChange: () => {
                },
              }}
              showColumnVisibility={true}
              emptyMessage="No se encontraron clientes"
              emptyIcon={<Building2 className="w-12 h-12 text-gray-300" />}
              getRowId={(row) => row.id_client.toString()}
            />
          </div>
        </>
      )}

      <ConfirmModal
        open={deleteModal.open}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleteModal.loading}
        variant="danger"
        icon={<Trash2 size={22} />}
        title="¿Eliminar cliente?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente a "${deleteModal.cliente?.name}".`}
        confirmLabel="Eliminar"
      />
    </PageWrapper>
  );
}
