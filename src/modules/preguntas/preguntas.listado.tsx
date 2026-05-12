import { toast } from 'sonner'
import { Plus, Users } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'


import { ClientListDTO, QuestionDTO,  } from '@/dtos'
import { useAuthStore } from '@/stores'
import { api, ApiResponse } from '@/lib'
import { ConectarClientesDialog, CrearEditarPreguntaDialog } from './components'
import { Button, PageWrapper, PageHeader, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DataTable, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components'



export function Preguntas() {
    const { user } = useAuthStore();

    const [preguntas, setPreguntas] = useState<QuestionDTO[]>([]);
    const [clientes, setClientes] = useState<ClientListDTO[]>([]);
    const [selectedClientFilter, setSelectedClientFilter] = useState<string>("0");
    const [showCrearDialog, setShowCrearDialog] = useState(false);
    const [showConectarDialog, setShowConectarDialog] = useState(false);
    const [preguntaSeleccionada, setPreguntaSeleccionada] = useState<QuestionDTO | null>(null);

    const handleNuevaPregunta = () => {
        setShowCrearDialog(true);
    };

    const handleAbrirConectar = (pregunta: QuestionDTO) => {
        setPreguntaSeleccionada(pregunta);
        setShowConectarDialog(true);
    };

    const fetchData = async () => {
        try {
            const res = await api.get<ApiResponse<QuestionDTO[]>>(`/questions/list/${user?.id_client}`);
            setPreguntas(res.data);
        } catch (error) {
            console.error("Error al cargar las preguntas:", error);
            toast.error("Error al cargar las preguntas");
        }
    };

    const preguntasFiltradas = useMemo(() => {
        if (selectedClientFilter === "0") {
            return preguntas;
        }

        const clientId = parseInt(selectedClientFilter);
        return preguntas.filter((p: QuestionDTO) =>
            p.questions_client?.some((c) => c.id_client === clientId)
        );
    }, [preguntas, selectedClientFilter]);

    useEffect(() => {
        const load = async () => {
            try {
                await fetchData();

                const fetchClients = async () => {
                    const res = await api.get<ApiResponse<ClientListDTO[]>>(`/clients/`);
                    setClientes(res.data);
                };
                await fetchClients();
            } catch (error) {
                console.error("Error al cargar los datos:", error);
                toast.error("Error al cargar los datos");
            }
        };
        load();
    }, []); 


    // Columnas de la tabla
    const columns: ColumnDef<QuestionDTO>[] = [
        {
            accessorKey: "id",
            header: "#",
            cell: ({ row }) => (
                <div className="max-w-[250px]">
                    <p className="font-medium truncate">{row.original.id_question}</p>
                </div>
            ),
        },
        {
            accessorKey: "question",
            header: "Pregunta",
        },
        {
            accessorKey: "question_type",
            header: "Tipo",
            cell: ({ row }) => {

                switch (row.original.question_type) {
                    case "open":
                        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Abierta</span>;
                    case "closed":
                        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Cerrada</span>;
                    case "numeric":
                        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Numérica</span>;
                    case "boolean":
                        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Booleana</span>;
                    default:
                        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Desconocida</span>;
                }
            },
        },
        {
            accessorKey: "clients",
            header: "Clientes asociados",
            cell: ({ row }) => {
                const clientAssignments = row.original.questions_client || [];
                const total = clientAssignments.length;

                if (total === 0) {
                    return <span className="text-sm text-gray-500">Sin clientes asociados</span>;
                }

                const visible = clientAssignments.slice(0, 3);
                const remaining = total - 3;

                return (
                    <div className="flex flex-wrap items-center gap-1">
                        {visible.map((ca) => (
                            <span
                                key={ca.id_client}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                            >
                                {ca.clients.name}
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded font-medium">
                                +{remaining} más
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "dt_register",
            header: "Fecha de creación",
            cell: ({ row }) => {
                const date = new Date(row.original.dt_register);
                return (
                    <span>
                        {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                );
            },
        },
        {
            id: "operaciones",
            header: "Operaciones",
            cell: ({ row }) => {
                return (
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleAbrirConectar(row.original)}
                                >
                                    <Users size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Conectar clientes</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
    ];

    return (
        <>
            <PageWrapper>
                <PageHeader title="Preguntas" />

                <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Filtrar por cliente:</span>
                            <Select
                                value={selectedClientFilter}
                                onValueChange={setSelectedClientFilter}
                                disabled={clientes.length === 0}
                            >
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Todos los clientes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Todos los clientes</SelectItem>
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
                        {selectedClientFilter !== "0" && (
                            <button
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                                onClick={() => setSelectedClientFilter("0")}
                            >
                                Limpiar filtro
                            </button>
                        )}
                    </div>

                    <Button onClick={handleNuevaPregunta} className="flex items-center gap-2">
                        <Plus size={18} />
                        Nueva pregunta
                    </Button>
                </div>
                <DataTable columns={columns} data={preguntasFiltradas} />
            </PageWrapper>

            

            <CrearEditarPreguntaDialog
                open={showCrearDialog}
                onOpenChange={setShowCrearDialog}
                id_question={null}
                onSuccess={() => {
                    setShowCrearDialog(false);
                    fetchData();
                }}
            />

            <ConectarClientesDialog
                open={showConectarDialog}
                onOpenChange={setShowConectarDialog}
                pregunta={preguntaSeleccionada}
                onSuccess={() => {
                    fetchData();
                }}
            />
        </>
    );
}

