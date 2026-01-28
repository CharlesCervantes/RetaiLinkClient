import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
    HelpCircle,
    Plus,
    Loader2,
    MoreHorizontal,
    Eye,
    Edit2,
    Trash2,
    Users,
    DollarSign,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/datatble";
import { Badge } from "../../components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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
    getQuestions,
    deleteQuestion,
    getClientsForQuestion,
    Question,
    ClientAssignment,
    QUESTION_TYPE_LABELS,
} from "../../Fetch/questions";
import { getCLientsList } from "../../Fetch/clientes";

import { CrearEditarPreguntaDialog } from "./components/CrearEditarPreguntaDialog";
import { AsignarClienteDialog } from "./components/AsignarClienteDialog";
import { ListaClientesDialog } from "./components/ListaClientesDialog";

interface Cliente {
    id_client: number;
    name: string;
}

// Extender Question para incluir clientes asignados
interface QuestionWithClients extends Question {
    assignedClients?: ClientAssignment[];
}

export function PreguntasSuperAdmin() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Estados principales
    const [loading, setLoading] = useState(true);
    const [preguntas, setPreguntas] = useState<QuestionWithClients[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [selectedClientFilter, setSelectedClientFilter] = useState<string>("all");

    // Estados para dialogs
    const [showCrearDialog, setShowCrearDialog] = useState(false);
    const [showAsignarDialog, setShowAsignarDialog] = useState(false);
    const [showClientesDialog, setShowClientesDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Pregunta seleccionada para operaciones
    const [selectedPregunta, setSelectedPregunta] = useState<QuestionWithClients | null>(null);
    const [editMode, setEditMode] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Cargar preguntas y clientes en paralelo
            const [preguntasRes, clientesRes] = await Promise.all([
                getQuestions(),
                getCLientsList(),
            ]);

            if (preguntasRes.ok && preguntasRes.data) {
                // Cargar clientes asignados para cada pregunta
                const preguntasConClientes = await Promise.all(
                    preguntasRes.data.map(async (pregunta) => {
                        try {
                            const clientesRes = await getClientsForQuestion(pregunta.id_question);
                            return {
                                ...pregunta,
                                assignedClients: clientesRes.ok ? clientesRes.data || [] : [],
                            };
                        } catch {
                            return { ...pregunta, assignedClients: [] };
                        }
                    })
                );
                setPreguntas(preguntasConClientes);
            }

            if (clientesRes?.data) {
                setClientes(
                    clientesRes.data.map((c: { id_client: number; name: string }) => ({
                        id_client: c.id_client,
                        name: c.name,
                    }))
                );
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast.error("Error al cargar las preguntas");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar preguntas por cliente
    const preguntasFiltradas = useMemo(() => {
        if (selectedClientFilter === "all") {
            return preguntas;
        }
        const clientId = parseInt(selectedClientFilter);
        return preguntas.filter((p) =>
            p.assignedClients?.some((c) => c.id_client === clientId)
        );
    }, [preguntas, selectedClientFilter]);

    // Handlers
    const handleCrear = () => {
        setSelectedPregunta(null);
        setEditMode(false);
        setShowCrearDialog(true);
    };

    const handleEditar = (pregunta: QuestionWithClients) => {
        setSelectedPregunta(pregunta);
        setEditMode(true);
        setShowCrearDialog(true);
    };

    const handleAsignar = (pregunta: QuestionWithClients) => {
        setSelectedPregunta(pregunta);
        setShowAsignarDialog(true);
    };

    const handleVerClientes = (pregunta: QuestionWithClients) => {
        setSelectedPregunta(pregunta);
        setShowClientesDialog(true);
    };

    const handleConfirmDelete = (pregunta: QuestionWithClients) => {
        setSelectedPregunta(pregunta);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        if (!selectedPregunta || !user) return;

        try {
            const result = await deleteQuestion(selectedPregunta.id_question, user.id_user);
            if (result.ok) {
                toast.success("Pregunta eliminada correctamente");
                fetchData();
            } else {
                toast.error(result.message || "Error al eliminar la pregunta");
            }
        } catch (error) {
            console.error("Error eliminando pregunta:", error);
            toast.error("Error al eliminar la pregunta");
        } finally {
            setShowDeleteConfirm(false);
            setSelectedPregunta(null);
        }
    };

    const handleVerDetalle = (pregunta: QuestionWithClients) => {
        navigate(`/preguntas/detalle/${pregunta.id_question}`);
    };

    // Columnas de la tabla
    const columns: ColumnDef<QuestionWithClients>[] = [
        {
            accessorKey: "question",
            header: "Pregunta",
            cell: ({ row }) => (
                <div className="max-w-[250px]">
                    <p className="font-medium truncate">{row.original.question}</p>
                </div>
            ),
        },
        {
            accessorKey: "question_type",
            header: "Tipo",
            cell: ({ row }) => {
                const type = row.original.question_type || "open";
                return (
                    <Badge variant="outline" className="text-xs">
                        {QUESTION_TYPE_LABELS[type] || type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "base_price",
            header: "Precio Base",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                        ${row.original.base_price.toFixed(2)}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "promoter_earns",
            header: "Ganancia Promotor",
            cell: ({ row }) => (
                <span className="text-green-600 font-medium">
                    ${row.original.promoter_earns.toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: "i_status",
            header: "Estado",
            cell: ({ row }) => (
                <Badge variant={row.original.i_status ? "default" : "secondary"}>
                    {row.original.i_status ? "Activo" : "Inactivo"}
                </Badge>
            ),
        },
        {
            id: "clientes",
            header: "Clientes Asignados",
            cell: ({ row }) => {
                const clientes = row.original.assignedClients || [];
                const count = clientes.length;

                if (count === 0) {
                    return (
                        <span className="text-gray-400 text-sm">Sin asignar</span>
                    );
                }

                // Mostrar hasta 3 clientes, si hay más mostrar botón
                const visibleClients = clientes.slice(0, 3);
                const hasMore = count > 3;

                return (
                    <div className="flex items-center gap-2">
                        <div className="flex flex-wrap gap-1">
                            {visibleClients.map((c) => (
                                <Badge
                                    key={c.id_question_client}
                                    variant="outline"
                                    className="text-xs"
                                >
                                    {c.client_name}
                                </Badge>
                            ))}
                        </div>
                        {hasMore && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleVerClientes(row.original)}
                            >
                                +{count - 3} mas
                            </Button>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const pregunta = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleVerDetalle(pregunta)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditar(pregunta)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAsignar(pregunta)}>
                                <Users className="mr-2 h-4 w-4" />
                                Asignar a cliente
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleConfirmDelete(pregunta)}
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

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Preguntas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Administra las preguntas y su asignacion a clientes
                    </p>
                </div>

                <Button onClick={handleCrear} className="flex items-center gap-2">
                    <Plus size={18} />
                    Nueva Pregunta
                </Button>
            </div>

            {/* Filtro por cliente */}
            <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtrar por cliente:</span>
                    <Select
                        value={selectedClientFilter}
                        onValueChange={setSelectedClientFilter}
                    >
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Todos los clientes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los clientes</SelectItem>
                            {clientes.map((cliente) => (
                                <SelectItem
                                    key={cliente.id_client}
                                    value={cliente.id_client.toString()}
                                >
                                    {cliente.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {selectedClientFilter !== "all" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClientFilter("all")}
                    >
                        Limpiar filtro
                    </Button>
                )}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            )}

            {/* Tabla */}
            {!loading && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    {preguntasFiltradas.length > 0 ? (
                        <DataTable columns={columns} data={preguntasFiltradas} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <HelpCircle size={32} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-1">
                                Sin preguntas
                            </h4>
                            <p className="text-gray-500 mb-4">
                                {selectedClientFilter === "all"
                                    ? "No hay preguntas registradas aun."
                                    : "No hay preguntas asignadas a este cliente."}
                            </p>
                            {selectedClientFilter === "all" && (
                                <Button onClick={handleCrear}>
                                    <Plus size={16} className="mr-2" />
                                    Crear primera pregunta
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Dialogs */}
            <CrearEditarPreguntaDialog
                open={showCrearDialog}
                onOpenChange={setShowCrearDialog}
                pregunta={editMode ? selectedPregunta : null}
                onSuccess={() => {
                    setShowCrearDialog(false);
                    fetchData();
                }}
            />

            <AsignarClienteDialog
                open={showAsignarDialog}
                onOpenChange={setShowAsignarDialog}
                pregunta={selectedPregunta}
                onSuccess={() => {
                    setShowAsignarDialog(false);
                    fetchData();
                }}
            />

            <ListaClientesDialog
                open={showClientesDialog}
                onOpenChange={setShowClientesDialog}
                pregunta={selectedPregunta}
                onUnassign={() => fetchData()}
            />

            {/* Confirmacion de eliminacion */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar pregunta</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta seguro de eliminar la pregunta "{selectedPregunta?.question}"?
                            Esta accion no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
