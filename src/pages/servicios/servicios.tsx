import { useState } from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { formatDate } from "date-fns/format";

import { useAuthStore } from "../../store/authStore";

import {Button} from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DataTable } from "../../components/ui/datatble";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

import {Plus, Search, Filter, MoreHorizontal, CheckCircle, XCircle, PlayCircle, FileText, Trash2, Clock, Pencil, Eye, History} from "lucide-react";

import { Servicio, fetchCrearServicio } from "../../Fetch/servicios";
import { ModalCustom } from '../../components/ModalCustom'



export default function Servicios() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [ statusFilter, setStatusFilter] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);

    function handleCreate() {
        setIsModalOpen(true);
    }

    function handleSearch(term: string) {
        console.log("Buscar servicios con el término:", term);
    }

    function handleStatusFilter(status: string) {
        setStatusFilter(Number(status));
        setLoading(true);
        try {

            const parsedStatus = Number(status);

            if (parsedStatus === 0 && !searchTerm.trim()) {
                // fetchData();
                return;
            }

            // TODO: Implementar la lógica de filtrado por estado
            
        } catch (error) {
            console.error("f.handleStatusFilter: ", error);
            toast.error("Error al filtrar");
        } finally {
            setLoading(false);
        }
    }

    const handleViewBitacora = (servicio: Servicio) => {
        console.log("Ver bitácora del servicio:", servicio);
    }

    function handleEdit(servicio: Servicio): void {
        throw new Error("Function not implemented.");
    }

    function handleStatusChange(servicio: Servicio, arg1: string): void {
        throw new Error("Function not implemented.");
    }

    function handleDelete(servicio: Servicio): void {
        throw new Error("Function not implemented.");
    }

    async function handleSave() {
        try {

            const peticion = await fetchCrearServicio({
                id_client: user?.id_client || 0,
                id_user: user?.id_user || 0
            });

            console.log("peticion crear servicio: ", peticion);
            
            return true;
        } catch (error) {
            console.error("f.handleSave: ", error);
            toast.error("Error al guardar el servicio");
            return false;
        }
    }

    const columns: ColumnDef<Servicio>[] = [
        {
            accessorKey: "folio",
            header: "Folio",
            cell: ({ row }) => (
                <span className="font-mono text-sm font-medium">
                    {row.original.vc_folio}
                </span>
            ),
        },
        {
            accessorKey: "fecha_registro",
            header: "Fecha de registro",
            cell: ({ row }) => formatDate(row.original.dt_created, "dd/MM/yyyy"),
        },
        {
            accessorKey: "fecha_actualizaccion",
            header: "Fecha de actualización",
            cell: ({ row }) => formatDate(row.original.dt_updated, "dd/MM/yyyy"),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const servicio = row.original;
                const isDraft = servicio.id_status === 1;
                const isPending = servicio.id_status === 2;
                const isApproved = servicio.id_status === 3;
                const isInProgress = servicio.id_status === 4;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => navigate(`/cotizaciones/detalle/${servicio.id_service}`)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalle
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleViewBitacora(servicio)}>
                                <History className="mr-2 h-4 w-4" />
                                Ver bitácora
                            </DropdownMenuItem>

                            {isDraft && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEdit(servicio)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "pending")}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Enviar a aprobación
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleDelete(servicio)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </>
                            )}

                            {isPending && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "approved")}
                                        className="text-green-600"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Aprobar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "draft")}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Regresar a borrador
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "cancelled")}
                                        className="text-red-600"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar
                                    </DropdownMenuItem>
                                </>
                            )}

                            {isApproved && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "in_progress")}
                                        className="text-blue-600"
                                    >
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Iniciar (generar tickets)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "cancelled")}
                                        className="text-red-600"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar
                                    </DropdownMenuItem>
                                </>
                            )}

                            {isInProgress && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(servicio, "completed")}
                                        className="text-purple-600"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Marcar completada
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Servicios</h1>
                    <p className="text-muted-foreground">
                        Gestiona los servicios
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Servicio
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio, nombre o cliente..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={statusFilter.toString()}
                        onValueChange={(value) => handleStatusFilter(value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Todos los estados</SelectItem>
                            <SelectItem value="1">Borrador</SelectItem>
                            <SelectItem value="2">Pendiente</SelectItem>
                            <SelectItem value="3">Aprobada</SelectItem>
                            <SelectItem value="4">En progreso</SelectItem>
                            <SelectItem value="5">Completada</SelectItem>
                            <SelectItem value="6">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={[]}
                isLoading={loading}
            />

            {/* Create/Edit Dialog */}
             <ModalCustom
                size="full"
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                showTrigger={false}
                dialogTitle="Crear Nuevo Servicio"
                dialogDescription="Llena los campos para crear un nuevo servicio."
                body={
                    <div className="space-y-4">
                        {/* Tu formulario aquí */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre</label>
                            <Input placeholder="Nombre del servicio" />
                        </div>
                        {/* Más campos... */}
                    </div>
                }
                isLoading={isLoading}
                onSubmit={handleSave}
            />

        </div>
    );
}
