import { toast } from "sonner"
import { useEffect, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Loader2, CheckCircle2, Clock, DollarSign, Banknote } from "lucide-react"


import { useAuthStore } from "@/stores"
import { DataTable, PageHeader, PageWrapper, StatCard } from "@/components"
import { getMisPagos, MiPago, PromoterPaymentStatus } from "@/Fetch/finanzas"


const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("es-MX") : "—";

const BadgeStatus = ({ status }: { status: PromoterPaymentStatus }) => {
  const map = {
    pagado: "bg-green-100 text-green-800",
    pendiente: "bg-amber-100 text-amber-800",
  };
  const label = { pagado: "Pagado", pendiente: "Pendiente" };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
};



export function FinanzasAdmin() {
  const { user } = useAuthStore();
  const [pagos, setPagos] = useState<MiPago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMisPagos(user.id_user)
      .then((res) => { if (res.ok) setPagos(res.data); })
      .catch(() => toast.error("Error al cargar tus pagos"))
      .finally(() => setLoading(false));
  }, [user]);

  const totalCobrado = pagos.filter((p) => p.status === "pagado").reduce((a, p) => a + p.f_monto, 0);
  const totalPendiente = pagos.filter((p) => p.status === "pendiente").reduce((a, p) => a + p.f_monto, 0);

  const columns: ColumnDef<MiPago>[] = [
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
      accessorKey: "f_monto",
      header: "Monto",
      cell: ({ row }) => (
        <span className="font-semibold">{fmt(row.getValue("f_monto"))}</span>
      ),
    },
    {
      accessorKey: "dt_periodo_inicio",
      header: "Período",
      cell: ({ row }) => (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {fmtDate(row.original.dt_periodo_inicio)} – {fmtDate(row.original.dt_periodo_fin)}
        </span>
      ),
    },
    {
      accessorKey: "dt_pago",
      header: "Fecha de pago",
      cell: ({ row }) => fmtDate(row.getValue("dt_pago")),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => <BadgeStatus status={row.getValue("status")} />,
    },
  ];

  if (loading)
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Cargando pagos...</span>
        </div>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <PageHeader
        title="Mis Pagos"
        subtitle="Historial y estado de tus pagos por servicios como promotor"
        icon={Banknote}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <StatCard title="Total acumulado" value={fmt(totalCobrado + totalPendiente)} icon={DollarSign} />
        <StatCard title="Cobrado" value={fmt(totalCobrado)} icon={CheckCircle2} accent="#16a34a" />
        <StatCard title="Pendiente" value={fmt(totalPendiente)} icon={Clock} accent="#d97706" />
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
        <DataTable
          columns={columns}
          data={pagos}
          isLoading={false}
          emptyMessage="No tienes pagos registrados aún."
        />
      </div>
    </PageWrapper>
  );
}
