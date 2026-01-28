import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    HelpCircle,
    Package,
    History,
    Calendar,
    DollarSign,
    User,
    MapPin,
    Ticket,
    Edit,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

import { useAuthStore } from "../../store/authStore";
import {
    Cotizacion,
    CotizacionEstablecimiento,
    CotizacionPregunta,
    CotizacionProducto,
    COTIZACION_STATUS_LABELS,
    COTIZACION_STATUS_COLORS,
    getCotizacionById,
    getCotizacionByIdForClient,
} from "../../Fetch/cotizaciones";
import BitacoraDialog from "./components/BitacoraDialog";

export default function CotizacionDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isSuperAdmin } = useAuthStore();

    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
    const [loading, setLoading] = useState(true);
    const [bitacoraDialogOpen, setBitacoraDialogOpen] = useState(false);

    const fetchData = async () => {
        if (!id) return;

        setLoading(true);
        try {
            let response;
            if (isSuperAdmin()) {
                response = await getCotizacionById(parseInt(id));
            } else if (user?.id_client) {
                response = await getCotizacionByIdForClient(user.id_client, parseInt(id));
            } else {
                toast.error("No tienes permisos para ver esta cotización");
                navigate(-1);
                return;
            }

            if (response.ok && response.data) {
                setCotizacion(response.data);
            } else {
                toast.error(response.message || "Error al cargar cotización");
                navigate(-1);
            }
        } catch {
            toast.error("Error de conexión");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

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
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (date?: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!cotizacion) {
        return (
            <div className="p-6">
                <p>Cotización no encontrada</p>
            </div>
        );
    }

    const canEdit = isSuperAdmin() && cotizacion.status === "draft";
    const showEditWarning = cotizacion.status !== "draft" && cotizacion.can_edit_after_tickets;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">
                                {cotizacion.folio}
                            </h1>
                            <Badge className={COTIZACION_STATUS_COLORS[cotizacion.status]}>
                                {COTIZACION_STATUS_LABELS[cotizacion.status]}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{cotizacion.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setBitacoraDialogOpen(true)}
                    >
                        <History className="mr-2 h-4 w-4" />
                        Bitácora
                    </Button>
                    {canEdit && (
                        <Button onClick={() => navigate(`/cotizaciones/editar/${cotizacion.id_cotizacion}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    )}
                </div>
            </div>

            {/* Edit Warning */}
            {showEditWarning && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-yellow-800">
                            Cotización editable después de generar tickets
                        </p>
                        <p className="text-sm text-yellow-700">
                            Esta cotización permite modificaciones incluso después de generar tickets.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Establecimientos
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {cotizacion.total_establecimientos}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Puntos de venta incluidos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Preguntas
                        </CardTitle>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {cotizacion.total_preguntas}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Preguntas del checklist
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Productos
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {cotizacion.total_productos}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Productos a evaluar
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(cotizacion.total)}
                        </div>
                        {cotizacion.tax && (
                            <p className="text-xs text-muted-foreground">
                                Incluye {formatCurrency(cotizacion.tax)} de impuestos
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cotizacion.description && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Descripción
                                </p>
                                <p>{cotizacion.description}</p>
                            </div>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Período
                                    </p>
                                    <p>
                                        {cotizacion.dt_start || cotizacion.dt_end
                                            ? `${formatDate(cotizacion.dt_start)} - ${formatDate(cotizacion.dt_end)}`
                                            : "Sin definir"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Creado por
                                    </p>
                                    <p>{cotizacion.created_by_name || "Usuario"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Fecha de creación
                                    </p>
                                    <p>{formatDateTime(cotizacion.dt_register)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Última actualización
                                    </p>
                                    <p>{formatDateTime(cotizacion.dt_updated)}</p>
                                </div>
                            </div>
                        </div>

                        {cotizacion.products_per_service !== undefined && (
                            <>
                                <Separator />
                                <div className="flex items-start gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Productos por servicio
                                        </p>
                                        <p>{cotizacion.products_per_service}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(cotizacion.subtotal)}</span>
                        </div>
                        {cotizacion.tax !== undefined && cotizacion.tax > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IVA</span>
                                <span>{formatCurrency(cotizacion.tax)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(cotizacion.total)}</span>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Configuración</p>
                            <div className="flex items-center gap-2 text-sm">
                                {cotizacion.can_edit_after_tickets ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Editable después de tickets</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-gray-400" />
                                        <span className="text-muted-foreground">
                                            No editable después de tickets
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Details */}
            <Tabs defaultValue="establecimientos" className="w-full">
                <TabsList>
                    <TabsTrigger value="establecimientos">
                        <Building2 className="mr-2 h-4 w-4" />
                        Establecimientos ({cotizacion.establecimientos?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="preguntas">
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Preguntas ({cotizacion.preguntas?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="productos">
                        <Package className="mr-2 h-4 w-4" />
                        Productos ({cotizacion.productos?.length || 0})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="establecimientos" className="mt-4">
                    <EstablecimientosTab establecimientos={cotizacion.establecimientos || []} />
                </TabsContent>

                <TabsContent value="preguntas" className="mt-4">
                    <PreguntasTab preguntas={cotizacion.preguntas || []} />
                </TabsContent>

                <TabsContent value="productos" className="mt-4">
                    <ProductosTab productos={cotizacion.productos || []} />
                </TabsContent>
            </Tabs>

            {/* Bitacora Dialog */}
            <BitacoraDialog
                open={bitacoraDialogOpen}
                onOpenChange={setBitacoraDialogOpen}
                cotizacion={cotizacion}
                isAdmin={!isSuperAdmin()}
            />
        </div>
    );
}

// Sub-components for tabs
function EstablecimientosTab({
    establecimientos,
}: {
    establecimientos: CotizacionEstablecimiento[];
}) {
    const formatLimit = (limit?: number) => {
        if (limit === undefined || limit === null) return "Sin límite";
        return limit.toString();
    };

    if (establecimientos.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No hay establecimientos asignados</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Establecimientos</CardTitle>
                <CardDescription>
                    Puntos de venta incluidos en esta cotización
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead className="text-center">Límite visitas</TableHead>
                            <TableHead className="text-center">Tickets generados</TableHead>
                            <TableHead className="text-center">Completados</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {establecimientos.map((est) => (
                            <TableRow key={est.id_cotizacion_establecimiento}>
                                <TableCell className="font-mono text-sm">
                                    {est.store_code || "-"}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {est.store_name}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {est.address || "-"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline">
                                        {formatLimit(est.visits_limit)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Ticket className="h-4 w-4 text-muted-foreground" />
                                        {est.tickets_generated}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge
                                        variant={est.tickets_completed > 0 ? "default" : "secondary"}
                                    >
                                        {est.tickets_completed}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function PreguntasTab({ preguntas }: { preguntas: CotizacionPregunta[] }) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    if (preguntas.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    <HelpCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No hay preguntas asignadas</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preguntas</CardTitle>
                <CardDescription>
                    Checklist de preguntas para los promotores
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pregunta</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-right">Promotor gana</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {preguntas.map((pregunta) => (
                            <TableRow key={pregunta.id_cotizacion_pregunta}>
                                <TableCell className="font-medium">
                                    {pregunta.question_text}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {pregunta.question_type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(pregunta.price)}
                                </TableCell>
                                <TableCell className="text-right text-green-600">
                                    {formatCurrency(pregunta.promoter_earns)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function ProductosTab({ productos }: { productos: CotizacionProducto[] }) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    if (productos.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No hay productos asignados</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Productos</CardTitle>
                <CardDescription>
                    Productos a evaluar en cada visita
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Cantidad</TableHead>
                            <TableHead className="text-right">Precio unitario</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productos.map((producto) => (
                            <TableRow key={producto.id_cotizacion_producto}>
                                <TableCell className="font-mono text-sm">
                                    {producto.product_sku || "-"}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {producto.product_name}
                                </TableCell>
                                <TableCell className="text-center">
                                    {producto.quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(producto.unit_price)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(producto.subtotal)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
