import { toast } from "sonner"
import { useState } from "react"
import { Banknote, ArrowLeftRight, CreditCard, Store, Loader2, CheckCircle2, Receipt } from "lucide-react"


import { marcarCobroPagado, CobroPedido, MetodoPago, RegistrarPagoPayload } from "@/Fetch/finanzas";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Textarea } from "@/components";



interface Props {
  cobro: CobroPedido | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (id_cobro: number, payload: RegistrarPagoPayload) => void;
}


const METODOS: {
  key: MetodoPago;
  label: string;
  icon: React.ElementType;
  color: string;
  border: string;
  refLabel?: string;
  refPlaceholder?: string;
}[] = [
  {
    key: "efectivo",
    label: "Efectivo",
    icon: Banknote,
    color: "bg-green-50 text-green-700",
    border: "border-green-400",
  },
  {
    key: "transferencia",
    label: "Transferencia",
    icon: ArrowLeftRight,
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-400",
    refLabel: "Folio / No. de referencia",
    refPlaceholder: "Ej. 123456789012345678",
  },
  {
    key: "tarjeta",
    label: "Tarjeta",
    icon: CreditCard,
    color: "bg-purple-50 text-purple-700",
    border: "border-purple-400",
    refLabel: "Últimos 4 dígitos",
    refPlaceholder: "Ej. 4321",
  },
  {
    key: "oxxo",
    label: "Depósito OXXO",
    icon: Store,
    color: "bg-red-50 text-red-700",
    border: "border-red-400",
    refLabel: "Folio de pago",
    refPlaceholder: "Ej. OXX-2025-00012345",
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function ModalRegistrarCobro({ cobro, open, onClose, onSuccess }: Props) {
  const hoy = new Date().toISOString().split("T")[0];

  const [metodo, setMetodo] = useState<MetodoPago>("transferencia");
  const [fecha, setFecha] = useState(hoy);
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const metodoCfg = METODOS.find((m) => m.key === metodo)!;

  const handleClose = () => {
    setMetodo("transferencia");
    setFecha(hoy);
    setReferencia("");
    setNotas("");
    onClose();
  };

  const handleConfirmar = async () => {
    if (!cobro) return;
    if (!fecha) {
      toast.error("Selecciona una fecha de pago");
      return;
    }

    setGuardando(true);
    const payload: RegistrarPagoPayload = {
      dt_pago: fecha,
      metodo_pago: metodo,
      ...(referencia.trim() ? { referencia: referencia.trim() } : {}),
      ...(notas.trim() ? { notas: notas.trim() } : {}),
    };

    try {
      await marcarCobroPagado(cobro.id_cobro, payload);
      onSuccess(cobro.id_cobro, payload);
      toast.success("Cobro registrado correctamente");
      handleClose();
    } catch {
      toast.error("Error al registrar el cobro");
    } finally {
      setGuardando(false);
    }
  };

  if (!cobro) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-green-600" />
            Registrar cobro
          </DialogTitle>
        </DialogHeader>

        {/* Info del cobro */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Cliente</span>
            <span className="font-semibold text-gray-900">{cobro.client_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pedido</span>
            <span className="font-medium text-gray-700">#{cobro.id_order}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Campaña</span>
            <span className="font-medium text-gray-700 text-right max-w-[60%]">
              {cobro.request_name}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-600 font-medium">Monto a cobrar</span>
            <span className="text-xl font-bold text-green-600">{fmt(cobro.f_pendiente)}</span>
          </div>
        </div>

        {/* Selector de método */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Método de pago</Label>
          <div className="grid grid-cols-2 gap-2">
            {METODOS.map((m) => {
              const Icon = m.icon;
              const selected = metodo === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => { setMetodo(m.key); setReferencia(""); }}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selected
                      ? `${m.color} ${m.border}`
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Referencia (condicional) */}
        {metodoCfg.refLabel && (
          <div className="space-y-1.5">
            <Label htmlFor="referencia" className="text-sm font-medium text-gray-700">
              {metodoCfg.refLabel}
            </Label>
            <Input
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder={metodoCfg.refPlaceholder}
            />
          </div>
        )}

        {/* Fecha */}
        <div className="space-y-1.5">
          <Label htmlFor="fecha-cobro" className="text-sm font-medium text-gray-700">
            Fecha de pago
          </Label>
          <Input
            id="fecha-cobro"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <Label htmlFor="notas-cobro" className="text-sm font-medium text-gray-700">
            Notas <span className="text-gray-400 font-normal">(opcional)</span>
          </Label>
          <Textarea
            id="notas-cobro"
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej. Pago parcial acordado con el cliente..."
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={guardando}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Confirmar cobro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
