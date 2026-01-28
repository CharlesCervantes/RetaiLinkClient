import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import {
    HelpCircle,
    Loader2,
    Eye,
    DollarSign,
    Search,
    TrendingUp,
    Hash,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/datatble";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

import { useAuthStore } from "../../store/authStore";
import {
    getQuestionsForMyClient,
    searchQuestions,
    getQuestionStats,
    QuestionClient,
    QuestionStats,
    QUESTION_TYPE_LABELS,
} from "../../Fetch/questions";

export function PreguntasAdmin() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Estados
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [preguntas, setPreguntas] = useState<QuestionClient[]>([]);
    const [stats, setStats] = useState<QuestionStats | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Cargar datos iniciales
    useEffect(() => {
        if (user?.id_client) {
            fetchData();
        }
    }, [user?.id_client]);

    const fetchData = async () => {
        if (!user?.id_client) return;

        try {
            setLoading(true);

            // Cargar preguntas y estadisticas en paralelo
            const [preguntasRes, statsRes] = await Promise.all([
                getQuestionsForMyClient(user.id_client),
                getQuestionStats(user.id_client),
            ]);

            if (preguntasRes.ok && preguntasRes.data) {
                setPreguntas(preguntasRes.data);
            }

            if (statsRes.ok && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast.error("Error al cargar las preguntas");
        } finally {
            setLoading(false);
        }
    };

    // Referencia para el timeout del debounce
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Busqueda con debounce manual
    const debouncedSearch = (term: string) => {
        // Limpiar timeout anterior
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            if (!user?.id_client) return;

            if (!term.trim()) {
                // Si no hay termino de busqueda, recargar todas
                fetchData();
                return;
            }

            try {
                setSearching(true);
                const result = await searchQuestions(user.id_client, term);

                if (result.ok && result.data) {
                    setPreguntas(result.data);
                }
            } catch (error) {
                console.error("Error buscando:", error);
                toast.error("Error al buscar preguntas");
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleVerDetalle = (pregunta: QuestionClient) => {
        navigate(`/preguntas/detalle/${pregunta.id_question_client}`);
    };

    // Columnas de la tabla
    const columns: ColumnDef<QuestionClient>[] = [
        {
            accessorKey: "question",
            header: "Pregunta",
            cell: ({ row }) => (
                <div className="max-w-[300px]">
                    <p className="font-medium">{row.original.question}</p>
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
            accessorKey: "client_price",
            header: "Precio",
            cell: ({ row }) => {
                const clientPrice = row.original.client_price;
                const basePrice = row.original.base_price;
                const isCustomPrice = clientPrice !== basePrice && clientPrice > 0;

                return (
                    <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                            ${(isCustomPrice ? clientPrice : basePrice).toFixed(2)}
                        </span>
                        {isCustomPrice && (
                            <Badge variant="outline" className="text-xs ml-1">
                                Personalizado
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "client_promoter_earns",
            header: "Ganancia Promotor",
            cell: ({ row }) => {
                const clientEarns = row.original.client_promoter_earns;
                const baseEarns = row.original.promoter_earns;
                const isCustom = clientEarns !== baseEarns && clientEarns > 0;

                return (
                    <span className="text-green-600 font-medium">
                        ${(isCustom ? clientEarns : baseEarns).toFixed(2)}
                    </span>
                );
            },
        },
        {
            accessorKey: "question_status",
            header: "Estado",
            cell: ({ row }) => (
                <Badge variant={row.original.question_status ? "default" : "secondary"}>
                    {row.original.question_status ? "Activo" : "Inactivo"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerDetalle(row.original)}
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                </Button>
            ),
        },
    ];

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Mis Preguntas</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Preguntas asignadas a tu cuenta
                    </p>
                </div>
            </div>

            {/* Estadisticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Preguntas
                            </CardTitle>
                            <Hash className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_questions}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Precio Total
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.total_price.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Precio Promedio
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${stats.avg_price.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Ganancia Promedio
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${stats.avg_promoter_earns.toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Buscador */}
            <div className="mb-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar preguntas..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                    {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                </div>
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
                    {preguntas.length > 0 ? (
                        <DataTable columns={columns} data={preguntas} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <HelpCircle size={32} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-1">
                                Sin preguntas
                            </h4>
                            <p className="text-gray-500">
                                {searchTerm
                                    ? "No se encontraron preguntas con ese termino"
                                    : "No tienes preguntas asignadas aun"}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
