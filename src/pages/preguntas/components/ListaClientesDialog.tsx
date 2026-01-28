import { useState } from "react";
import { Loader2, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

import { useAuthStore } from "../../../store/authStore";
import {
    unassignQuestionFromClient,
    Question,
    ClientAssignment,
} from "../../../Fetch/questions";

interface QuestionWithClients extends Question {
    assignedClients?: ClientAssignment[];
}

interface ListaClientesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pregunta: QuestionWithClients | null;
    onUnassign: () => void;
}

export function ListaClientesDialog({
    open,
    onOpenChange,
    pregunta,
    onUnassign,
}: ListaClientesDialogProps) {
    const { user } = useAuthStore();

    const [showConfirmUnassign, setShowConfirmUnassign] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<ClientAssignment | null>(null);
    const [loadingUnassign, setLoadingUnassign] = useState(false);

    const handleConfirmUnassign = (assignment: ClientAssignment) => {
        setSelectedAssignment(assignment);
        setShowConfirmUnassign(true);
    };

    const handleUnassign = async () => {
        if (!pregunta || !selectedAssignment || !user) return;

        setLoadingUnassign(true);

        try {
            const result = await unassignQuestionFromClient(
                pregunta.id_question,
                selectedAssignment.id_client,
                user.id_user
            );

            if (result.ok) {
                toast.success(`Pregunta desasignada de ${selectedAssignment.client_name}`);
                onUnassign();
            } else {
                toast.error(result.message || "Error al desasignar la pregunta");
            }
        } catch (error) {
            console.error("Error desasignando pregunta:", error);
            toast.error("Error al desasignar la pregunta");
        } finally {
            setLoadingUnassign(false);
            setShowConfirmUnassign(false);
            setSelectedAssignment(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const clientes = pregunta?.assignedClients || [];

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Clientes Asignados</DialogTitle>
                        <DialogDescription>
                            Lista de clientes que tienen asignada esta pregunta
                        </DialogDescription>
                    </DialogHeader>

                    {/* Info de la pregunta */}
                    {pregunta && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-medium text-gray-700">Pregunta:</p>
                            <p className="text-sm text-gray-600">{pregunta.question}</p>
                        </div>
                    )}

                    {/* Tabla de clientes */}
                    <div className="border rounded-lg max-h-[400px] overflow-auto">
                        {clientes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay clientes asignados a esta pregunta
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                Precio
                                            </div>
                                        </TableHead>
                                        <TableHead>Ganancia Promotor</TableHead>
                                        <TableHead>Fecha Asignacion</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clientes.map((assignment) => (
                                        <TableRow key={assignment.id_question_client}>
                                            <TableCell className="font-medium">
                                                {assignment.client_name}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    ${assignment.client_price.toFixed(2)}
                                                </span>
                                                {assignment.client_price !== pregunta?.base_price && (
                                                    <span className="text-xs text-gray-400 ml-1">
                                                        (base: ${pregunta?.base_price.toFixed(2)})
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-green-600 font-medium">
                                                    ${assignment.client_promoter_earns.toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {formatDate(assignment.assigned_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleConfirmUnassign(assignment)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Resumen */}
                    {clientes.length > 0 && (
                        <div className="text-sm text-gray-500 mt-2">
                            Total: {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} asignado
                            {clientes.length !== 1 ? "s" : ""}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmacion de desasignacion */}
            <AlertDialog open={showConfirmUnassign} onOpenChange={setShowConfirmUnassign}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Desasignar pregunta</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta seguro de desasignar esta pregunta de "{selectedAssignment?.client_name}"?
                            El cliente ya no podra ver ni usar esta pregunta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loadingUnassign}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnassign}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loadingUnassign}
                        >
                            {loadingUnassign && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Desasignar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
