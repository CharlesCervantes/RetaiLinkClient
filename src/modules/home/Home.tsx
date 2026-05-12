import { useState, useEffect } from "react"
import { Users, Store, UserCheck, Briefcase, Loader2, ShoppingCart } from "lucide-react"


import { useAuthStore } from "@/stores"
// import { PromoterHeatMap } from "../../pages/inicio/components"
import { StatCard, DateRangePicker, PageWrapper } from "@/components"
import { getDashboardAnalytics, getAdminDashboardStats, DashboardAnalytics, AdminDashboardStats } from "@/Fetch/inicio"


const defaultDateFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
};

const toISOLocal = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function Home() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.i_rol === 1;

  const [dateFrom, setDateFrom] = useState<Date>(defaultDateFrom());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const [superStats, setSuperStats] = useState<DashboardAnalytics | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Carga superadmin ──────────────────────────────────────────────────────
  const fetchSuperStats = async (from: Date, to: Date) => {
    setLoading(true);
    try {
      const data = await getDashboardAnalytics(toISOLocal(from), toISOLocal(to));
      setSuperStats(data);
    } catch (error) {
      console.error("Error cargando analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Carga admin ───────────────────────────────────────────────────────────
  const fetchAdminStats = async () => {
    if (!user?.id_client) return;
    setLoading(true);
    try {
      const data = await getAdminDashboardStats(user.id_client);
      setAdminStats(data);
    } catch (error) {
      console.error("Error cargando stats de admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSuperStats(dateFrom, dateTo);
    } else {
      fetchAdminStats();
    }
  }, []);

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    if (!from || !to) return;
    setDateFrom(from);
    setDateTo(to);
    if (isSuperAdmin) fetchSuperStats(from, to);
  };

  // ── Heatmap data ──────────────────────────────────────────────────────────
  const heatmapData = isSuperAdmin
    ? (superStats?.heatmapPromoters ?? [])
    : (adminStats?.heatmapPromoters ?? []);

  return (
    <PageWrapper>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {isSuperAdmin ? "Vista general de todos los negocios" : "Vista de tu negocio"}
          </p>
        </div>
        {isSuperAdmin && <DateRangePicker onDateChange={handleDateChange} />}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : isSuperAdmin ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard title="Clientes" value={(superStats?.totalClients ?? 0).toLocaleString()} icon={Users} description="Total de clientes" trend={{ value: 12.5, isPositive: true }} />
          <StatCard title="Promotores" value={(superStats?.totalUsuariosPromotores ?? 0).toLocaleString()} icon={UserCheck} accent="#2563eb" description="Registrados" trend={{ value: 8.2, isPositive: true }} />
          <StatCard title="Establecimientos" value={(superStats?.totalStores ?? 0).toLocaleString()} icon={Store} accent="#7c3aed" description="Total" trend={{ value: 3.1, isPositive: true }} />
          <StatCard title="Activos" value={(superStats?.activeUsersPromoters ?? 0).toLocaleString()} icon={Briefcase} accent="#16a34a" description={`${dateFrom.toLocaleDateString("es-MX")} – ${dateTo.toLocaleDateString("es-MX")}`} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
          <StatCard title="Mis Establecimientos" value={(adminStats?.totalStores ?? 0).toLocaleString()} icon={Store} accent="#7c3aed" description="De tu negocio" />
          <StatCard title="Mis Pedidos" value={(adminStats?.totalOrders ?? 0).toLocaleString()} icon={ShoppingCart} accent="#2563eb" description="Generados" />
          <StatCard title="Total Promotores" value={(adminStats?.totalPromoters ?? 0).toLocaleString()} icon={UserCheck} description="En la plataforma" />
          <StatCard title="Activos" value={(adminStats?.activePromoters ?? 0).toLocaleString()} icon={Briefcase} accent="#16a34a" description="Cuenta activa" />
        </div>
      )}

      {/* Heatmap superadmin — solo si hay datos */}
      {/* {!loading && isSuperAdmin && heatmapData.length > 0 && (
        <PromoterHeatMap promoters={heatmapData} />
      )} */}

      {/* Heatmap admin — siempre visible una vez cargado (promotores globales) */}
      {/* {!loading && !isSuperAdmin && adminStats !== null && (
        <PromoterHeatMap promoters={heatmapData} />
      )} */}
    </PageWrapper>
  );
}
