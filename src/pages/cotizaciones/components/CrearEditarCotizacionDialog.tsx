import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { Calendar } from "../../../components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { cn } from "../../../lib/utils";

import { useAuthStore } from "../../../store/authStore";
import {
    Cotizacion,
    CreateCotizacionPayload,
    UpdateCotizacionPayload,
    createCotizacion,
    updateCotizacion,
} from "../../../Fetch/cotizaciones";
import { getCLientsList } from "../../../Fetch/clientes";

interface Client {
    id_client: number;
    name: string;
    email?: string;
}

interface CrearEditarCotizacionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cotizacion: Cotizacion | null;
    onSuccess: () => void;
}

interface FormData {
    id_client: string;
    name: string;
    description: string;
    dt_start: Date | undefined;
    dt_end: Date | undefined;
    products_per_service: string;
    can_edit_after_tickets: boolean;
}

interface FormErrors {
    id_client?: string;
    name?: string;
    dates?: string;
    products_per_service?: string;
}

export default function CrearEditarCotizacionDialog({
    open,
    onOpenChange,
    cotizacion,
    onSuccess,
}: CrearEditarCotizacionDialogProps) {
    const { user, isSuperAdmin } = useAuthStore();
    const [formData, setFormData] = useState<FormData>({
        id_client: "",
        name: "",
        description: "",
        dt_start: undefined,
        dt_end: undefined,
        products_per_service: "",
        can_edit_after_tickets: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);

    const isEditing = !!cotizacion;
    const showClientSelector = isSuperAdmin();

    useEffect(() => {
        if (open) {
            // Solo cargar clientes si es SuperAdmin
            if (showClientSelector) {
                fetchClients();
            }

            if (cotizacion) {
                // Editando cotización existente
                setFormData({
                    id_client: cotizacion.id_client.toString(),
                    name: cotizacion.name,
                    description: cotizacion.description || "",
                    dt_start: cotizacion.dt_start ? new Date(cotizacion.dt_start) : undefined,
                    dt_end: cotizacion.dt_end ? new Date(cotizacion.dt_end) : undefined,
                    products_per_service: cotizacion.products_per_service?.toString() || "",
                    can_edit_after_tickets: cotizacion.can_edit_after_tickets,
                });
            } else {
                // Nueva cotización
                setFormData({
                    // Si es Admin, usar su id_client automáticamente
                    id_client: !showClientSelector && user?.id_client
                        ? user.id_client.toString()
                        : "",
                    name: "",
                    description: "",
                    dt_start: undefined,
                    dt_end: undefined,
                    products_per_service: "",
                    can_edit_after_tickets: false,
                });
            }
            setErrors({});
        }
    }, [open, cotizacion, showClientSelector, user?.id_client]);

    const fetchClients = async () => {
        setLoadingClients(true);
        try {
            const response = await getCLientsList();
            if (response.ok && response.data) {
                setClients(response.data);
            }
        } catch {
            toast.error("Error al cargar clientes");
        } finally {
            setLoadingClients(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        // Solo validar cliente si es SuperAdmin (Admin ya tiene id_client asignado)
        if (showClientSelector && !formData.id_client) {
            newErrors.id_client = "Selecciona un cliente";
        }

        if (!formData.name.trim()) {
            newErrors.name = "El nombre es requerido";
        } else if (formData.name.length < 3) {
            newErrors.name = "El nombre debe tener al menos 3 caracteres";
        }

        if (formData.dt_start && formData.dt_end) {
            if (formData.dt_end < formData.dt_start) {
                newErrors.dates = "La fecha de fin debe ser posterior a la de inicio";
            }
        }

        if (formData.products_per_service) {
            const value = parseInt(formData.products_per_service);
            if (isNaN(value) || value < 1) {
                newErrors.products_per_service = "Debe ser un número positivo";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!user?.id_user) return;

        // Determinar el id_client a usar
        const clientId = showClientSelector
            ? parseInt(formData.id_client)
            : user.id_client;

        if (!clientId) {
            toast.error("Error: No se pudo determinar el cliente");
            return;
        }

        setLoading(true);
        try {
            if (isEditing) {
                const payload: UpdateCotizacionPayload = {
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    dt_start: formData.dt_start?.toISOString().split("T")[0],
                    dt_end: formData.dt_end?.toISOString().split("T")[0],
                    products_per_service: formData.products_per_service
                        ? parseInt(formData.products_per_service)
                        : undefined,
                    can_edit_after_tickets: formData.can_edit_after_tickets,
                };

                const response = await updateCotizacion(cotizacion.id_cotizacion, payload);
                if (response.ok) {
                    toast.success("Cotización actualizada");
                    onSuccess();
                } else {
                    toast.error(response.message || "Error al actualizar");
                }
            } else {
                const payload: CreateCotizacionPayload = {
                    id_client: clientId,
                    id_user_created: user.id_user,
                    name: formData.name.trim(),
                    description: formData.description.trim() || undefined,
                    dt_start: formData.dt_start?.toISOString().split("T")[0],
                    dt_end: formData.dt_end?.toISOString().split("T")[0],
                    products_per_service: formData.products_per_service
                        ? parseInt(formData.products_per_service)
                        : undefined,
                    can_edit_after_tickets: formData.can_edit_after_tickets,
                };

                const response = await createCotizacion(payload);
                if (response.ok) {
                    toast.success("Cotización creada");
                    onSuccess();
                } else {
                    toast.error(response.message || "Error al crear");
                }
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Cotización" : "Nueva Cotización"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos de la cotización"
                            : "Crea una nueva cotización de servicio"}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Cliente - Solo visible para SuperAdmin */}
                    {showClientSelector && (
                        <div className="space-y-2">
                            <Label htmlFor="client">Cliente *</Label>
                            <Select
                                value={formData.id_client}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, id_client: value })
                                }
                                disabled={isEditing || loadingClients}
                            >
                                <SelectTrigger className={errors.id_client ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Selecciona un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((client) => (
                                        <SelectItem
                                            key={client.id_client}
                                            value={client.id_client.toString()}
                                        >
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.id_client && (
                                <p className="text-sm text-red-500">{errors.id_client}</p>
                            )}
                        </div>
                    )}

                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre de la cotización *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Ej: Auditoría Q1 2024 - Zona Norte"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Descripción opcional del proyecto..."
                            rows={3}
                        />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha de inicio</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.dt_start && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.dt_start ? (
                                            format(formData.dt_start, "PP", { locale: es })
                                        ) : (
                                            <span>Seleccionar</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.dt_start}
                                        onSelect={(date) =>
                                            setFormData({ ...formData, dt_start: date })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Fecha de fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.dt_end && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.dt_end ? (
                                            format(formData.dt_end, "PP", { locale: es })
                                        ) : (
                                            <span>Seleccionar</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.dt_end}
                                        onSelect={(date) =>
                                            setFormData({ ...formData, dt_end: date })
                                        }
                                        initialFocus
                                        disabled={(date) =>
                                            formData.dt_start
                                                ? date < formData.dt_start
                                                : false
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    {errors.dates && (
                        <p className="text-sm text-red-500">{errors.dates}</p>
                    )}

                    {/* Productos por servicio (reservado) */}
                    <div className="space-y-2">
                        <Label htmlFor="products_per_service">
                            Productos por servicio (opcional)
                        </Label>
                        <Input
                            id="products_per_service"
                            type="number"
                            min="1"
                            value={formData.products_per_service}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    products_per_service: e.target.value,
                                })
                            }
                            placeholder="Ej: 5"
                            className={errors.products_per_service ? "border-red-500" : ""}
                        />
                        {errors.products_per_service && (
                            <p className="text-sm text-red-500">
                                {errors.products_per_service}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Cantidad de productos a evaluar por visita (configuración reservada)
                        </p>
                    </div>

                    {/* Checkbox editable después de tickets */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="can_edit_after_tickets"
                            checked={formData.can_edit_after_tickets}
                            onCheckedChange={(checked) =>
                                setFormData({
                                    ...formData,
                                    can_edit_after_tickets: checked as boolean,
                                })
                            }
                        />
                        <Label
                            htmlFor="can_edit_after_tickets"
                            className="text-sm font-normal cursor-pointer"
                        >
                            Permitir edición después de generar tickets
                        </Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? "Guardar cambios" : "Crear cotización"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
