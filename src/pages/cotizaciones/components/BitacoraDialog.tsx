import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    History,
    User,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    PlayCircle,
    PauseCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Skeleton } from "../../../components/ui/skeleton";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../../../components/ui/collapsible";

import { useAuthStore } from "../../../store/authStore";
import {
    Cotizacion,
    CotizacionLog,
    LOG_TYPE_LABELS,
    getCotizacionLogs,
    getCotizacionLogsForClient,
} from "../../../Fetch/cotizaciones";

interface BitacoraDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cotizacion: Cotizacion | null;
    isAdmin?: boolean;
}

export default function BitacoraDialog({
    open,
    onOpenChange,
    cotizacion,
    isAdmin = false,
}: BitacoraDialogProps) {
    const { user, isSuperAdmin } = useAuthStore();
    const [logs, setLogs] = useState<CotizacionLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSystemLogs, setShowSystemLogs] = useState(false);

    useEffect(() => {
        if (open && cotizacion) {
            fetchLogs();
        }
    }, [open, cotizacion, showSystemLogs]);

    const fetchLogs = async () => {
        if (!cotizacion) return;

        setLoading(true);
        try {
            let response;
            if (isAdmin && user?.id_client) {
                response = await getCotizacionLogsForClient(
                    user.id_client,
                    cotizacion.id_cotizacion
                );
            } else {
                response = await getCotizacionLogs(
                    cotizacion.id_cotizacion,
                    showSystemLogs
                );
            }

            if (response.ok && response.data) {
                setLogs(response.data);
            } else {
                toast.error(response.message || "Error al cargar bitácora");
            }
        } catch {
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionIcon = (action: string) => {
        const lowerAction = action.toLowerCase();

        if (lowerAction.includes("crear") || lowerAction.includes("creada")) {
            return <FileText className="h-4 w-4 text-blue-500" />;
        }
        if (lowerAction.includes("aprobar") || lowerAction.includes("aprobada")) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (lowerAction.includes("cancelar") || lowerAction.includes("cancelada")) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }
        if (lowerAction.includes("pendiente") || lowerAction.includes("aprobación")) {
            return <Clock className="h-4 w-4 text-yellow-500" />;
        }
        if (lowerAction.includes("iniciar") || lowerAction.includes("progreso")) {
            return <PlayCircle className="h-4 w-4 text-blue-500" />;
        }
        if (lowerAction.includes("completar") || lowerAction.includes("completada")) {
            return <CheckCircle className="h-4 w-4 text-purple-500" />;
        }
        if (lowerAction.includes("pausar") || lowerAction.includes("pausada")) {
            return <PauseCircle className="h-4 w-4 text-orange-500" />;
        }
        if (lowerAction.includes("agregar") || lowerAction.includes("añadir")) {
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (lowerAction.includes("eliminar") || lowerAction.includes("remover")) {
            return <XCircle className="h-4 w-4 text-red-500" />;
        }

        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    };

    const parseDetails = (details?: string): Record<string, unknown> | null => {
        if (!details) return null;
        try {
            return JSON.parse(details);
        } catch {
            return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Bitácora de Cotización
                    </DialogTitle>
                    <DialogDescription>
                        {cotizacion && (
                            <>
                                Historial de cambios para{" "}
                                <span className="font-mono font-medium">
                                    {cotizacion.folio}
                                </span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Toggle para logs de sistema (solo SuperAdmin) */}
                {isSuperAdmin() && !isAdmin && (
                    <div className="flex items-center justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSystemLogs(!showSystemLogs)}
                        >
                            {showSystemLogs ? "Ocultar logs de sistema" : "Mostrar logs de sistema"}
                        </Button>
                    </div>
                )}

                <ScrollArea className="h-[400px] pr-4">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <History className="h-12 w-12 mb-4 opacity-50" />
                            <p>No hay registros en la bitácora</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, index) => (
                                <LogEntry
                                    key={log.id_log}
                                    log={log}
                                    isLast={index === logs.length - 1}
                                    getActionIcon={getActionIcon}
                                    formatDateTime={formatDateTime}
                                    parseDetails={parseDetails}
                                    showSystemBadge={showSystemLogs && log.i_tipo === 2}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

interface LogEntryProps {
    log: CotizacionLog;
    isLast: boolean;
    getActionIcon: (action: string) => React.ReactNode;
    formatDateTime: (date: string) => string;
    parseDetails: (details?: string) => Record<string, unknown> | null;
    showSystemBadge: boolean;
}

function LogEntry({
    log,
    isLast,
    getActionIcon,
    formatDateTime,
    parseDetails,
    showSystemBadge,
}: LogEntryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const details = parseDetails(log.details);

    return (
        <div className="relative">
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
            )}

            <div className="flex gap-4 pb-4">
                {/* Icon */}
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border">
                    {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{log.user_name || "Usuario"}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>{formatDateTime(log.dt_register)}</span>
                            </div>
                        </div>
                        {showSystemBadge && (
                            <Badge variant="secondary" className="text-xs">
                                {LOG_TYPE_LABELS[log.i_tipo]}
                            </Badge>
                        )}
                    </div>

                    {/* Details (collapsible if exists) */}
                    {details && (
                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {isOpen ? (
                                        <>
                                            <ChevronUp className="mr-1 h-3 w-3" />
                                            Ocultar detalles
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="mr-1 h-3 w-3" />
                                            Ver detalles
                                        </>
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="mt-2 rounded-md bg-muted p-3 text-xs font-mono">
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(details, null, 2)}
                                    </pre>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
            </div>
        </div>
    );
}
