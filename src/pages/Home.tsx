import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { StatCard } from "../components/dashboard/StatCard";
import { DateRangePicker } from "../components/dashboard/DateRangePicker";
import { HeatMap } from "../components/dashboard/HeatMap";
import {
  Users,
  Building2,
  Store,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Briefcase,
} from "lucide-react";
import {
  mockSuperAdminStats,
  mockAdminStats,
  mockPromoterLocations,
  getStatsForNegocio,
  getPromotersForNegocio,
  DashboardStats,
  PromoterLocation,
} from "../data/mockDashboard";

//Charly aqui
export default function Home() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>(mockSuperAdminStats);
  const [promoters, setPromoters] = useState<PromoterLocation[]>(
    mockPromoterLocations,
  );
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const isSuperAdmin = user?.i_rol === 1;

  useEffect(() => {
    if (isSuperAdmin) {
      setStats(mockSuperAdminStats);
      setPromoters(mockPromoterLocations);
    } else if (user?.id_negocio) {
      setStats(getStatsForNegocio(user.id_negocio));
      setPromoters(getPromotersForNegocio(user.id_negocio));
    } else {
      setStats(mockAdminStats);
      setPromoters(mockPromoterLocations.filter((p) => p.idNegocio === 1));
    }
  }, [user, isSuperAdmin]);

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);

    console.log("Filtrar datos desde:", from, "hasta:", to);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isSuperAdmin
              ? "Vista general de todos los negocios"
              : `Vista de tu negocio${user?.id_negocio ? ` #${user.id_negocio}` : ""}`}
          </p>
        </div>
        <DateRangePicker onDateChange={handleDateChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clientes"
          value={stats.clientes.toLocaleString()}
          icon={Users}
          description={
            isSuperAdmin ? "Total de clientes" : "Clientes de tu negocio"
          }
          trend={{ value: 12.5, isPositive: true }}
        />

        <StatCard
          title="Usuarios"
          value={stats.usuarios.toLocaleString()}
          icon={UserCheck}
          description="Usuarios registrados"
          trend={{ value: 8.2, isPositive: true }}
        />

        <StatCard
          title="Establecimientos"
          value={stats.establecimientos.toLocaleString()}
          icon={Store}
          description={
            isSuperAdmin ? "Total establecimientos" : "Tus establecimientos"
          }
          trend={{ value: 3.1, isPositive: true }}
        />

        <StatCard
          title="Promotores Activos"
          value={`${stats.promotores.activos} / ${stats.promotores.total}`}
          icon={Briefcase}
          description={`${Math.round((stats.promotores.activos / stats.promotores.total) * 100)}% activos`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Tickets por Cobrar"
          value={formatCurrency(stats.ticketsPorCobrar.monto)}
          icon={TrendingUp}
          description={`${stats.ticketsPorCobrar.total} tickets pendientes`}
        />

        <StatCard
          title="Tickets por Pagar"
          value={formatCurrency(stats.ticketsPorPagar.monto)}
          icon={TrendingDown}
          description={`${stats.ticketsPorPagar.total} tickets pendientes`}
        />
      </div>

      <HeatMap promoters={promoters} />

      {dateFrom && dateTo && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Mostrando datos del{" "}
            <strong>{dateFrom.toLocaleDateString("es-MX")}</strong> al{" "}
            <strong>{dateTo.toLocaleDateString("es-MX")}</strong>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Los filtros de fecha están en desarrollo. Por ahora se muestran
            datos mock.
          </p>
        </div>
      )}
    </div>
  );
}
