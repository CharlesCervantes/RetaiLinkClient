import { toast } from "sonner"
import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2, DollarSign, Users, Banknote } from "lucide-react"


import { ModalRegistrarCobro, ModalRegistrarPagoPromotor } from './components'
import { Button, DataTable, PageWrapper, PageHeader, StatCard} from "@/components"
import { getCobros, getPagosPromotores, getResumenFinanzas, CobroPedido, PagoPromotor, ResumenFinanzas, PaymentStatus, PromoterPaymentStatus, RegistrarPagoPayload } from "@/Fetch/finanzas";



const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX") : "—";

const BadgeStatus = ({ status }: { status: PaymentStatus | PromoterPaymentStatus }) => {
  const map: Record<string, string> = {
    pagado: "bg-green-100 text-green-800",
    pendiente: "bg-amber-100 text-amber-800",
    vencido: "bg-red-100 text-red-800",
  };
  const label: Record<string, string> = {
    pagado: "Pagado",
    pendiente: "Pendiente",
    vencido: "Vencido",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

type Tab = "cobros" | "promotores";

export default function FinanzasSuperAdmin() {
  const [tab, setTab] = useState<Tab>("cobros");
  const [resumen, setResumen] = useState<ResumenFinanzas | null>(null);
  const [cobros, setCobros] = useState<CobroPedido[]>([]);
  const [pagos, setPagos] = useState<PagoPromotor[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Estado modales ─────────────────────────────────────────────────────────
  const [cobroSeleccionado, setCobroSeleccionado] = useState<CobroPedido | null>(null);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<PagoPromotor | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rRes, cRes, pRes] = await Promise.all([
          getResumenFinanzas(),
          getCobros(),
          getPagosPromotores(),
        ]);
        if (rRes.ok) setResumen(rRes.data);
        if (cRes.ok) setCobros(cRes.data);
        if (pRes.ok) setPagos(pRes.data);
      } catch {
        toast.error("Error al cargar datos financieros");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Callback éxito cobro ───────────────────────────────────────────────────
  const handleCobroSuccess = (id_cobro: number, payload: RegistrarPagoPayload) => {
    const cobro = cobros.find((c) => c.id_cobro === id_cobro);
    setCobros((prev) =>
      prev.map((c) =>
        c.id_cobro === id_cobro
          ? { ...c, status: "pagado", dt_pago: payload.dt_pago, f_pagado: c.f_total, f_pendiente: 0 }
          : c
      )
    );
    setResumen((prev) => {
      if (!prev || !cobro) return prev;
      return {
        ...prev,
        total_cobrado: prev.total_cobrado + cobro.f_total,
        total_pendiente_cobro: prev.total_pendiente_cobro - cobro.f_pendiente,
      };
    });
  };

  // ── Callback éxito pago promotor ───────────────────────────────────────────
  const handlePagoPromotorSuccess = (id_pago: number, payload: RegistrarPagoPayload) => {
    const pago = pagos.find((p) => p.id_pago === id_pago);
    setPagos((prev) =>
      prev.map((p) =>
        p.id_pago === id_pago ? { ...p, status: "pagado", dt_pago: payload.dt_pago } : p
      )
    );
    setResumen((prev) => {
      if (!prev || !pago) return prev;
      return {
        ...prev,
        total_pagado_promotores: prev.total_pagado_promotores + pago.f_monto,
        total_pendiente_promotores: prev.total_pendiente_promotores - pago.f_monto,
      };
    });
  };

  // ── Columnas cobros ────────────────────────────────────────────────────────
  const columnasCobros: ColumnDef<CobroPedido>[] = [
    {
      accessorKey: "id_order",
      header: "Pedido",
      cell: ({ row }) => <span className="font-bold text-gray-600">#{row.getValue("id_order")}</span>,
    },
    {
      accessorKey: "client_name",
      header: "Cliente",
      cell: ({ row }) => <span className="font-medium">{row.getValue("client_name")}</span>,
    },
    {
      accessorKey: "request_name",
      header: "Campaña",
    },
    {
      accessorKey: "f_total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">{fmt(row.getValue("f_total"))}</span>
      ),
    },
    {
      accessorKey: "dt_vencimiento",
      header: "Vencimiento",
      cell: ({ row }) => fmtDate(row.getValue("dt_vencimiento")),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <BadgeStatus status={row.getValue("status")} />,
    },
    {
      id: "actions",
      header: "Acción",
      cell: ({ row }) => {
        const cobro = row.original;
        if (cobro.status === "pagado") return <span className="text-xs text-gray-400">—</span>;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCobroSeleccionado(cobro)}
            className="text-green-700 border-green-300 hover:bg-green-50"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Registrar cobro
          </Button>
        );
      },
    },
  ];

  // ── Columnas pagos promotores ──────────────────────────────────────────────
  const columnasPagos: ColumnDef<PagoPromotor>[] = [
    {
      accessorKey: "promoter_name",
      header: "Promotor",
      cell: ({ row }) => <span className="font-medium">{row.getValue("promoter_name")}</span>,
    },
    {
      accessorKey: "request_name",
      header: "Campaña",
    },
    {
      accessorKey: "f_monto",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">{fmt(row.getValue("f_monto"))}</span>
      ),
    },
    {
      accessorKey: "dt_periodo_inicio",
      header: "Período",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {fmtDate(row.original.dt_periodo_inicio)} – {fmtDate(row.original.dt_periodo_fin)}
        </span>
      ),
    },
    {
      accessorKey: "dt_pago",
      header: "Fecha pago",
      cell: ({ row }) => fmtDate(row.getValue("dt_pago")),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <BadgeStatus status={row.getValue("status")} />,
    },
    {
      id: "actions",
      header: "Acción",
      cell: ({ row }) => {
        const pago = row.original;
        if (pago.status === "pagado") return <span className="text-xs text-gray-400">—</span>;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPagoSeleccionado(pago)}
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Registrar pago
          </Button>
        );
      },
    },
  ];

  if (loading)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Cargando finanzas...</span>
        </div>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <PageHeader
        title="Finanzas"
        subtitle="Gestión de cobros a clientes y pagos a promotores"
        icon={Banknote}
      />

      {resumen && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <StatCard title="Total cobrado" value={fmt(resumen.total_cobrado)} icon={TrendingUp} accent="#16a34a" />
          <StatCard title="Por cobrar" value={fmt(resumen.total_pendiente_cobro)} icon={AlertCircle} accent="#dc2626" />
          <StatCard title="Pagado promotores" value={fmt(resumen.total_pagado_promotores)} icon={Users} accent="#2563eb" />
          <StatCard title="Pendiente promotores" value={fmt(resumen.total_pendiente_promotores)} icon={Clock} accent="#d97706" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--hover)" }}>
        {(["cobros", "promotores"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={
              tab === t
                ? { backgroundColor: "var(--card-bg)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "var(--text-secondary)" }
            }
          >
            {t === "cobros" ? <DollarSign className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            {t === "cobros" ? "Cobros a clientes" : "Pagos a promotores"}
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--border)", color: "var(--text-secondary)" }}>
              {t === "cobros" ? cobros.length : pagos.length}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
        {tab === "cobros" ? (
          <DataTable columns={columnasCobros} data={cobros} isLoading={false} emptyMessage="No hay cobros registrados." />
        ) : (
          <DataTable columns={columnasPagos} data={pagos} isLoading={false} emptyMessage="No hay pagos de promotores registrados." />
        )}
      </div>

      {/* ── Modales ── */}
      <ModalRegistrarCobro
        cobro={cobroSeleccionado}
        open={cobroSeleccionado !== null}
        onClose={() => setCobroSeleccionado(null)}
        onSuccess={handleCobroSuccess}
      />

      <ModalRegistrarPagoPromotor
        pago={pagoSeleccionado}
        open={pagoSeleccionado !== null}
        onClose={() => setPagoSeleccionado(null)}
        onSuccess={handlePagoPromotorSuccess}
      />
    </PageWrapper>
  );
}
