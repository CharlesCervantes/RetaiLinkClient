import { useState, useEffect } from "react";
import { Loader2, Search, Check } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";

import { useAuthStore } from "../../../store/authStore";
import {
    assignQuestionToClient,
    Question,
} from "../../../Fetch/questions";
import { getCLientsList } from "../../../Fetch/clientes";

interface Cliente {
    id_client: number;
    name: string;
    email?: string;
}

interface AsignarClienteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pregunta: Question | null;
    onSuccess: () => void;
}

export function AsignarClienteDialog({
    open,
    onOpenChange,
    pregunta,
    onSuccess,
}: AsignarClienteDialogProps) {
    const { user } = useAuthStore();

    // Estados
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [loadingAsignar, setLoadingAsignar] = useState(false);

    // Precios personalizados
    const [clientPrice, setClientPrice] = useState("");
    const [clientPromoterEarns, setClientPromoterEarns] = useState("");

    // Paso actual (1: seleccionar cliente, 2: configurar precios)
    const [step, setStep] = useState(1);

    // Cargar clientes disponibles cuando se abre el dialog
    useEffect(() => {
        if (open && pregunta) {
            loadClientes();
            setStep(1);
            setSelectedCliente(null);
            setClientPrice("");
            setClientPromoterEarns("");
            setSearchTerm("");
        }
    }, [open, pregunta]);

    // Filtrar clientes por busqueda
    useEffect(() => {
        if (!searchTerm.trim()) {
            setClientesFiltrados(clientes);
        } else {
            const term = searchTerm.toLowerCase();
            setClientesFiltrados(
                clientes.filter(
                    (c) =>
                        c.name.toLowerCase().includes(term) ||
                        c.email?.toLowerCase().includes(term)
                )
            );
        }
    }, [searchTerm, clientes]);

    const loadClientes = async () => {
        setLoadingClientes(true);
        try {
            // Obtener todos los clientes
            const res = await getCLientsList();

            if (res?.data) {
                // Mapear clientes
                const todosLosClientes: Cliente[] = res.data.map(
                    (c: { id_client: number; name: string; email?: string }) => ({
                        id_client: c.id_client,
                        name: c.name,
                        email: c.email,
                    })
                );
                setClientes(todosLosClientes);
                setClientesFiltrados(todosLosClientes);
            }
        } catch (error) {
            console.error("Error cargando clientes:", error);
            toast.error("Error al cargar los clientes");
        } finally {
            setLoadingClientes(false);
        }
    };

    const handleSelectCliente = (cliente: Cliente) => {
        setSelectedCliente(cliente);
        // Pre-llenar precios con los valores base de la pregunta
        if (pregunta) {
            setClientPrice(pregunta.base_price.toString());
            setClientPromoterEarns(pregunta.promoter_earns.toString());
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedCliente(null);
    };

    const handleAsignar = async () => {
        if (!pregunta || !selectedCliente || !user) return;

        // Validar precios si se especifican
        const price = clientPrice ? parseFloat(clientPrice) : undefined;
        const promoterEarns = clientPromoterEarns
            ? parseFloat(clientPromoterEarns)
            : undefined;

        if (price !== undefined && (isNaN(price) || price < 0)) {
            toast.error("El precio debe ser un numero valido mayor o igual a 0");
            return;
        }

        if (
            promoterEarns !== undefined &&
            (isNaN(promoterEarns) || promoterEarns < 0)
        ) {
            toast.error("La ganancia debe ser un numero valido mayor o igual a 0");
            return;
        }

        if (price !== undefined && promoterEarns !== undefined && promoterEarns > price) {
            toast.error("La ganancia no puede ser mayor al precio");
            return;
        }

        setLoadingAsignar(true);

        try {
            const result = await assignQuestionToClient(
                pregunta.id_question,
                selectedCliente.id_client,
                {
                    id_user: user.id_user,
                    client_price: price,
                    client_promoter_earns: promoterEarns,
                }
            );

            if (result.ok) {
                toast.success(`Pregunta asignada a ${selectedCliente.name}`);
                onSuccess();
            } else {
                toast.error(result.message || "Error al asignar la pregunta");
            }
        } catch (error) {
            console.error("Error asignando pregunta:", error);
            toast.error("Error al asignar la pregunta");
        } finally {
            setLoadingAsignar(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Asignar Pregunta a Cliente</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Selecciona el cliente al que deseas asignar esta pregunta"
                            : "Configura los precios para este cliente (opcional)"}
                    </DialogDescription>
                </DialogHeader>

                {/* Info de la pregunta */}
                {pregunta && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-700">Pregunta:</p>
                        <p className="text-sm text-gray-600">{pregunta.question}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Precio base: ${pregunta.base_price.toFixed(2)}</span>
                            <span>Ganancia promotor: ${pregunta.promoter_earns.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {step === 1 ? (
                    // Paso 1: Seleccionar cliente
                    <div className="space-y-4">
                        {/* Buscador */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar cliente por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Tabla de clientes */}
                        <div className="border rounded-lg max-h-[300px] overflow-auto">
                            {loadingClientes ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            ) : clientesFiltrados.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {searchTerm
                                        ? "No se encontraron clientes"
                                        : "No hay clientes disponibles"}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="w-[100px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clientesFiltrados.map((cliente) => (
                                            <TableRow
                                                key={cliente.id_client}
                                                className="cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleSelectCliente(cliente)}
                                            >
                                                <TableCell className="font-medium">
                                                    {cliente.name}
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {cliente.email || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        Seleccionar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                ) : (
                    // Paso 2: Configurar precios
                    <div className="space-y-4">
                        {/* Cliente seleccionado */}
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <Check className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="font-medium text-green-800">
                                    {selectedCliente?.name}
                                </p>
                                <p className="text-sm text-green-600">
                                    {selectedCliente?.email}
                                </p>
                            </div>
                        </div>

                        {/* Precio para el cliente */}
                        <div className="space-y-2">
                            <Label htmlFor="client_price">
                                Precio para este cliente (MXN)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    $
                                </span>
                                <Input
                                    id="client_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={pregunta?.base_price.toString()}
                                    value={clientPrice}
                                    onChange={(e) => setClientPrice(e.target.value)}
                                    className="pl-7"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Si no especificas, se usara el precio base: $
                                {pregunta?.base_price.toFixed(2)}
                            </p>
                        </div>

                        {/* Ganancia promotor para el cliente */}
                        <div className="space-y-2">
                            <Label htmlFor="client_promoter_earns">
                                Ganancia del promotor para este cliente (MXN)
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    $
                                </span>
                                <Input
                                    id="client_promoter_earns"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={pregunta?.promoter_earns.toString()}
                                    value={clientPromoterEarns}
                                    onChange={(e) => setClientPromoterEarns(e.target.value)}
                                    className="pl-7"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Si no especificas, se usara la ganancia base: $
                                {pregunta?.promoter_earns.toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 1 ? (
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleBack} disabled={loadingAsignar}>
                                Atras
                            </Button>
                            <Button onClick={handleAsignar} disabled={loadingAsignar}>
                                {loadingAsignar && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Asignar pregunta
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
