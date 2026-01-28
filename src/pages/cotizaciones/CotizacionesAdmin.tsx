import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
    MoreHorizontal,
    Plus,
    Eye,
    Pencil,
    Trash2,
    Search,
    Filter,
    History,
    FileText,
    DollarSign,
    TrendingUp,
    Building2,
    Clock,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "../../components/ui/datatble";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import { useAuthStore } from "../../store/authStore";
import {
    Cotizacion,
    CotizacionStatus,
    CotizacionStats,
    COTIZACION_STATUS_LABELS,
    COTIZACION_STATUS_COLORS,
    getCotizacionesForClient,
    getCotizacionStats,
    searchCotizacionesForClient,
    deleteCotizacion,
    updateCotizacionStatus,
} from "../../Fetch/cotizaciones";
import CrearEditarCotizacionDialog from "./components/CrearEditarCotizacionDialog";
import BitacoraDialog from "./components/BitacoraDialog";

export default function CotizacionesAdmin() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
    const [stats, setStats] = useState<CotizacionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<CotizacionStatus | "all">("all");

    // Dialogs
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCotizacion, setSelectedCotizacion] = useState<Cotizacion | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cotizacionToDelete, setCotizacionToDelete] = useState<Cotizacion | null>(null);
    const [bitacoraDialogOpen, setBitacoraDialogOpen] = useState(false);
    const [bitacoraCotizacion, setBitacoraCotizacion] = useState<Cotizacion | null>(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusChange, setStatusChange] = useState<{
        cotizacion: Cotizacion;
        newStatus: CotizacionStatus;
    } | null>(null);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async () => {
        if (!user?.id_client) return;

        setLoading(true);
        try {
            const [cotizacionesRes, statsRes] = await Promise.all([
                getCotizacionesForClient(user.id_client),
                getCotizacionStats(user.id_client),
            ]);

            if (cotizacionesRes.ok && cotizacionesRes.data) {
                setCotizaciones(cotizacionesRes.data);
            } else {
                toast.error(cotizacionesRes.message || "Error al cargar cotizaciones");
            }

            if (statsRes.ok && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id_client]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            if (!user?.id_client) return;

            if (!term.trim() && statusFilter === "all") {
                fetchData();
                return;
            }

            setLoading(true);
            try {
                const response = await searchCotizacionesForClient(
                    user.id_client,
                    term,
                    statusFilter !== "all" ? statusFilter : undefined
                );
                if (response.ok && response.data) {
                    setCotizaciones(response.data);
                }
            } catch {
                toast.error("Error al buscar");
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleStatusFilter = async (status: CotizacionStatus | "all") => {
        setStatusFilter(status);
        if (!user?.id_client) return;

        setLoading(true);
        try {
            if (status === "all" && !searchTerm.trim()) {
                fetchData();
                return;
            }
            const response = await searchCotizacionesForClient(
                user.id_client,
                searchTerm,
                status !== "all" ? status : undefined
            );
            if (response.ok && response.data) {
                setCotizaciones(response.data);
            }
        } catch {
            toast.error("Error al filtrar");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedCotizacion(null);
        setDialogOpen(true);
    };

    const handleEdit = (cotizacion: Cotizacion) => {
        if (cotizacion.status !== "draft") {
            toast.error("Solo se pueden editar cotizaciones en borrador");
            return;
        }
        setSelectedCotizacion(cotizacion);
        setDialogOpen(true);
    };

    const handleDelete = (cotizacion: Cotizacion) => {
        if (cotizacion.status !== "draft") {
            toast.error("Solo se pueden eliminar cotizaciones en borrador");
            return;
        }
        setCotizacionToDelete(cotizacion);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!cotizacionToDelete) return;

        try {
            const response = await deleteCotizacion(cotizacionToDelete.id_cotizacion);
            if (response.ok) {
                toast.success("Cotización eliminada");
                fetchData();
            } else {
                toast.error(response.message || "Error al eliminar");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setDeleteDialogOpen(false);
            setCotizacionToDelete(null);
        }
    };

    const handleViewBitacora = (cotizacion: Cotizacion) => {
        setBitacoraCotizacion(cotizacion);
        setBitacoraDialogOpen(true);
    };

    const handleStatusChange = (cotizacion: Cotizacion, newStatus: CotizacionStatus) => {
        setStatusChange({ cotizacion, newStatus });
        setStatusDialogOpen(true);
    };

    const confirmStatusChange = async () => {
        if (!statusChange) return;

        try {
            const response = await updateCotizacionStatus(
                statusChange.cotizacion.id_cotizacion,
                statusChange.newStatus
            );
            if (response.ok) {
                toast.success(`Estado cambiado a ${COTIZACION_STATUS_LABELS[statusChange.newStatus]}`);
                fetchData();
            } else {
                toast.error(response.message || "Error al cambiar estado");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setStatusDialogOpen(false);
            setStatusChange(null);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    const formatDate = (date?: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const columns: ColumnDef<Cotizacion>[] = [
        {
            accessorKey: "folio",
            header: "Folio",
            cell: ({ row }) => (
                <span className="font-mono text-sm font-medium">
                    {row.original.folio}
                </span>
            ),
        },
        {
            accessorKey: "name",
            header: "Nombre",
            cell: ({ row }) => (
                <div className="max-w-[250px]">
                    <p className="font-medium truncate">{row.original.name}</p>
                    {row.original.description && (
                        <p className="text-xs text-muted-foreground truncate">
                            {row.original.description}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge className={COTIZACION_STATUS_COLORS[status]}>
                        {COTIZACION_STATUS_LABELS[status]}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "total_establecimientos",
            header: "Establ.",
            cell: ({ row }) => (
                <span className="text-center block">
                    {row.original.total_establecimientos}
                </span>
            ),
        },
        {
            accessorKey: "total_preguntas",
            header: "Preg.",
            cell: ({ row }) => (
                <span className="text-center block">
                    {row.original.total_preguntas}
                </span>
            ),
        },
        {
            accessorKey: "total",
            header: "Total",
            cell: ({ row }) => (
                <span className="font-medium">
                    {formatCurrency(row.original.total)}
                </span>
            ),
        },
        {
            accessorKey: "dt_start",
            header: "Período",
            cell: ({ row }) => (
                <div className="text-sm">
                    <p>{formatDate(row.original.dt_start)}</p>
                    {row.original.dt_end && (
                        <p className="text-muted-foreground">
                            a {formatDate(row.original.dt_end)}
                        </p>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const cotizacion = row.original;
                const isDraft = cotizacion.status === "draft";

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
                                onClick={() => navigate(`/cotizaciones/detalle/${cotizacion.id_cotizacion}`)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalle
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleViewBitacora(cotizacion)}>
                                <History className="mr-2 h-4 w-4" />
                                Ver bitácora
                            </DropdownMenuItem>

                            {isDraft && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEdit(cotizacion)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(cotizacion, "pending")}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Enviar a aprobación
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleDelete(cotizacion)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </DropdownMenuItem>
                                </>
                            )}

                            {cotizacion.status === "pending" && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(cotizacion, "draft")}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Regresar a borrador
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(cotizacion, "cancelled")}
                                        className="text-red-600"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar
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
                    <h1 className="text-2xl font-bold">Mis Cotizaciones</h1>
                    <p className="text-muted-foreground">
                        Gestiona las cotizaciones de servicio de tu empresa
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Cotización
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Cotizaciones
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.by_status.in_progress} en progreso
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Valor Total
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.total_value)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                En todas las cotizaciones
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Promedio por Cotización
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.avg_value)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Valor promedio
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Por Estado
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1">
                                {stats.by_status.draft > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {stats.by_status.draft} borradores
                                    </Badge>
                                )}
                                {stats.by_status.pending > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {stats.by_status.pending} pendientes
                                    </Badge>
                                )}
                                {stats.by_status.approved > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {stats.by_status.approved} aprobadas
                                    </Badge>
                                )}
                                {stats.by_status.completed > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {stats.by_status.completed} completadas
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por folio o nombre..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => handleStatusFilter(value as CotizacionStatus | "all")}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="draft">Borrador</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="approved">Aprobada</SelectItem>
                            <SelectItem value="in_progress">En progreso</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={cotizaciones}
                isLoading={loading}
            />

            {/* Create/Edit Dialog */}
            <CrearEditarCotizacionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                cotizacion={selectedCotizacion}
                onSuccess={() => {
                    setDialogOpen(false);
                    fetchData();
                }}
            />

            {/* Bitacora Dialog */}
            <BitacoraDialog
                open={bitacoraDialogOpen}
                onOpenChange={setBitacoraDialogOpen}
                cotizacion={bitacoraCotizacion}
                isAdmin={true}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la
                            cotización <strong>{cotizacionToDelete?.folio}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Status Change Confirmation Dialog */}
            <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cambiar estado?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {statusChange && (
                                <>
                                    La cotización <strong>{statusChange.cotizacion.folio}</strong>{" "}
                                    cambiará de{" "}
                                    <Badge className={COTIZACION_STATUS_COLORS[statusChange.cotizacion.status]}>
                                        {COTIZACION_STATUS_LABELS[statusChange.cotizacion.status]}
                                    </Badge>{" "}
                                    a{" "}
                                    <Badge className={COTIZACION_STATUS_COLORS[statusChange.newStatus]}>
                                        {COTIZACION_STATUS_LABELS[statusChange.newStatus]}
                                    </Badge>
                                    {statusChange.newStatus === "pending" && (
                                        <p className="mt-2 text-blue-600">
                                            La cotización será enviada para aprobación.
                                        </p>
                                    )}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusChange}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
