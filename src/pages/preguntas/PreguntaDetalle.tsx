import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Loader2,
    HelpCircle,
    DollarSign,
    Users,
    Calendar,
    User,
    Edit2,
    Trash2,
    ListChecks,
    Hash,
    CalendarDays,
    Camera,
    Type,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
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
    getQuestionById,
    getClientsForQuestion,
    getQuestionClientById,
    deleteQuestion,
    unassignQuestionFromClient,
    Question,
    QuestionClient,
    ClientAssignment,
    QUESTION_TYPE_LABELS,
    QuestionType,
} from "../../Fetch/questions";

import { CrearEditarPreguntaDialog } from "./components/CrearEditarPreguntaDialog";
import { AsignarClienteDialog } from "./components/AsignarClienteDialog";

export default function PreguntaDetalle() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuthStore();

    const isSuperAdmin = user?.i_rol === 1;

    // Estados
    const [loading, setLoading] = useState(true);
    const [pregunta, setPregunta] = useState<Question | null>(null);
    const [preguntaClient, setPreguntaClient] = useState<QuestionClient | null>(null);
    const [clientesAsignados, setClientesAsignados] = useState<ClientAssignment[]>([]);

    // Dialogs
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAsignarDialog, setShowAsignarDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
    const [selectedClientToUnassign, setSelectedClientToUnassign] = useState<ClientAssignment | null>(null);

    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, isSuperAdmin]);

    const fetchData = async () => {
        if (!id) return;

        try {
            setLoading(true);

            if (isSuperAdmin) {
                // SuperAdmin: cargar pregunta completa + clientes asignados
                const [preguntaRes, clientesRes] = await Promise.all([
                    getQuestionById(parseInt(id)),
                    getClientsForQuestion(parseInt(id)),
                ]);

                if (preguntaRes.ok && preguntaRes.data) {
                    setPregunta(preguntaRes.data);
                } else {
                    toast.error("Pregunta no encontrada");
                    navigate("/preguntas");
                    return;
                }

                if (clientesRes.ok && clientesRes.data) {
                    setClientesAsignados(clientesRes.data);
                }
            } else {
                // Admin: cargar solo la pregunta asignada a su cliente
                if (!user?.id_client) return;

                const res = await getQuestionClientById(user.id_client, parseInt(id));

                if (res.ok && res.data) {
                    setPreguntaClient(res.data);
                } else {
                    toast.error("Pregunta no encontrada");
                    navigate("/preguntas");
                }
            }
        } catch (error) {
            console.error("Error cargando pregunta:", error);
            toast.error("Error al cargar la pregunta");
            navigate("/preguntas");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!pregunta || !user) return;

        setDeleting(true);
        try {
            const result = await deleteQuestion(pregunta.id_question, user.id_user);

            if (result.ok) {
                toast.success("Pregunta eliminada correctamente");
                navigate("/preguntas");
            } else {
                toast.error(result.message || "Error al eliminar la pregunta");
            }
        } catch (error) {
            console.error("Error eliminando:", error);
            toast.error("Error al eliminar la pregunta");
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleUnassign = async () => {
        if (!pregunta || !selectedClientToUnassign || !user) return;

        try {
            const result = await unassignQuestionFromClient(
                pregunta.id_question,
                selectedClientToUnassign.id_client,
                user.id_user
            );

            if (result.ok) {
                toast.success("Cliente desasignado correctamente");
                fetchData();
            } else {
                toast.error(result.message || "Error al desasignar");
            }
        } catch (error) {
            console.error("Error desasignando:", error);
            toast.error("Error al desasignar el cliente");
        } finally {
            setShowUnassignConfirm(false);
            setSelectedClientToUnassign(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Get icon for question type
    const getTypeIcon = (type: QuestionType) => {
        switch (type) {
            case "options":
                return <ListChecks className="h-5 w-5" />;
            case "yes_no":
                return <CheckCircle2 className="h-5 w-5" />;
            case "numeric":
                return <Hash className="h-5 w-5" />;
            case "date":
                return <CalendarDays className="h-5 w-5" />;
            case "photo":
                return <Camera className="h-5 w-5" />;
            default:
                return <Type className="h-5 w-5" />;
        }
    };

    // Render type-specific configuration
    const renderTypeConfig = (q: Question | QuestionClient) => {
        const type = q.question_type || "open";

        switch (type) {
            case "options":
                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Seleccion:</span>
                            <Badge variant="outline">
                                {q.is_multiple ? "Multiple" : "Unica"}
                            </Badge>
                        </div>
                        {q.options && q.options.length > 0 && (
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Opciones:</p>
                                <div className="flex flex-wrap gap-1">
                                    {q.options.map((opt, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                            {opt.option_text}
                                            {opt.option_value_numeric !== undefined && opt.option_value_numeric !== null && (
                                                <span className="ml-1 text-gray-400">
                                                    ({opt.option_value_numeric})
                                                </span>
                                            )}
                                            {opt.option_value_text && (
                                                <span className="ml-1 text-gray-400">
                                                    ({opt.option_value_text})
                                                </span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "numeric":
                return (
                    <div className="flex items-center gap-4">
                        {q.min_value !== undefined && q.min_value !== null && (
                            <div>
                                <span className="text-sm text-gray-500">Min: </span>
                                <span className="font-medium">{q.min_value}</span>
                            </div>
                        )}
                        {q.max_value !== undefined && q.max_value !== null && (
                            <div>
                                <span className="text-sm text-gray-500">Max: </span>
                                <span className="font-medium">{q.max_value}</span>
                            </div>
                        )}
                        {(q.min_value === undefined || q.min_value === null) &&
                         (q.max_value === undefined || q.max_value === null) && (
                            <span className="text-sm text-gray-400">Sin restricciones de rango</span>
                        )}
                    </div>
                );
            case "photo":
                return (
                    <div>
                        <span className="text-sm text-gray-500">Max fotos: </span>
                        <span className="font-medium">{q.max_photos || 1}</span>
                    </div>
                );
            case "yes_no":
                return (
                    <span className="text-sm text-gray-400">Respuesta: Si / No</span>
                );
            case "date":
                return (
                    <span className="text-sm text-gray-400">El promotor seleccionara una fecha</span>
                );
            default:
                return (
                    <span className="text-sm text-gray-400">Respuesta de texto libre</span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Vista para Admin (solo lectura)
    if (!isSuperAdmin && preguntaClient) {
        const efectivePrice = preguntaClient.client_price > 0
            ? preguntaClient.client_price
            : preguntaClient.base_price;
        const efectiveEarns = preguntaClient.client_promoter_earns > 0
            ? preguntaClient.client_promoter_earns
            : preguntaClient.promoter_earns;

        return (
            <>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/preguntas")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informacion principal */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <HelpCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl">
                                        {preguntaClient.question}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge
                                            variant={preguntaClient.question_status ? "default" : "secondary"}
                                        >
                                            {preguntaClient.question_status ? "Activo" : "Inactivo"}
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            {getTypeIcon(preguntaClient.question_type || "open")}
                                            {QUESTION_TYPE_LABELS[preguntaClient.question_type || "open"]}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Type configuration */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Tipo de respuesta
                                </p>
                                {renderTypeConfig(preguntaClient)}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Precios */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Precios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Tu precio</p>
                                <p className="text-2xl font-bold">
                                    ${efectivePrice.toFixed(2)}
                                </p>
                                {preguntaClient.client_price > 0 &&
                                 preguntaClient.client_price !== preguntaClient.base_price && (
                                    <p className="text-xs text-gray-400">
                                        Precio base: ${preguntaClient.base_price.toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ganancia del promotor</p>
                                <p className="text-xl font-bold text-green-600">
                                    ${efectiveEarns.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fecha de asignacion</p>
                                <p className="text-sm font-medium">
                                    {formatDate(preguntaClient.assigned_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    // Vista para SuperAdmin (completa)
    if (!pregunta) {
        return (
            <div className="text-center py-12">
                <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Pregunta no encontrada</p>
                <Button className="mt-4" onClick={() => navigate("/preguntas")}>
                    Volver a preguntas
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/preguntas")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Detalle de Pregunta
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informacion principal */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <HelpCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{pregunta.question}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge
                                        variant={pregunta.i_status ? "default" : "secondary"}
                                    >
                                        {pregunta.i_status ? "Activo" : "Inactivo"}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        {getTypeIcon(pregunta.question_type || "open")}
                                        {QUESTION_TYPE_LABELS[pregunta.question_type || "open"]}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Type configuration */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Configuracion de respuesta
                            </p>
                            {renderTypeConfig(pregunta)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                                <User className="h-4 w-4" />
                                <span>Creado por: {pregunta.created_by_name || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Creado: {formatDate(pregunta.dt_register)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Precios base */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Precios Base
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Precio base</p>
                            <p className="text-2xl font-bold">
                                ${pregunta.base_price.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ganancia promotor</p>
                            <p className="text-xl font-bold text-green-600">
                                ${pregunta.promoter_earns.toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Clientes asignados */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Clientes Asignados ({clientesAsignados.length})
                        </CardTitle>
                        <Button onClick={() => setShowAsignarDialog(true)}>
                            Asignar cliente
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {clientesAsignados.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No hay clientes asignados a esta pregunta</p>
                                <Button
                                    variant="outline"
                                    className="mt-3"
                                    onClick={() => setShowAsignarDialog(true)}
                                >
                                    Asignar primer cliente
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Precio Cliente</TableHead>
                                        <TableHead>Ganancia Promotor</TableHead>
                                        <TableHead>Fecha Asignacion</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientesAsignados.map((cliente) => (
                                        <TableRow key={cliente.id_question_client}>
                                            <TableCell className="font-medium">
                                                {cliente.client_name}
                                            </TableCell>
                                            <TableCell>
                                                ${cliente.client_price.toFixed(2)}
                                                {cliente.client_price !== pregunta.base_price && (
                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                        Personalizado
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-green-600">
                                                ${cliente.client_promoter_earns.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {formatDate(cliente.assigned_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => {
                                                        setSelectedClientToUnassign(cliente);
                                                        setShowUnassignConfirm(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialogs */}
            <CrearEditarPreguntaDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                pregunta={pregunta}
                onSuccess={() => {
                    setShowEditDialog(false);
                    fetchData();
                }}
            />

            <AsignarClienteDialog
                open={showAsignarDialog}
                onOpenChange={setShowAsignarDialog}
                pregunta={pregunta}
                onSuccess={() => {
                    setShowAsignarDialog(false);
                    fetchData();
                }}
            />

            {/* Confirmacion de eliminacion */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar pregunta</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta seguro de eliminar esta pregunta? Esta accion no se puede
                            deshacer y la pregunta sera desasignada de todos los clientes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting}
                        >
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirmacion de desasignacion */}
            <AlertDialog open={showUnassignConfirm} onOpenChange={setShowUnassignConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Desasignar cliente</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta seguro de desasignar a "{selectedClientToUnassign?.client_name}"
                            de esta pregunta?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnassign}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Desasignar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
