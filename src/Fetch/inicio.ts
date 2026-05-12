import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
};

export interface DashboardAnalytics {
  totalClients: number;
  totalUsuariosPromotores: number;
  totalStores: number;
  activeUsersPromoters: number;
  heatmapPromoters: HeatmapPromoter[];
}

export interface HeatmapPromoter {
  id_promoter: number;
  vc_name: string;
  f_latitude: number;
  f_longitude: number;
}

// ─── SUPERADMIN ───────────────────────────────────────────────────────────────

export const getDashboardAnalytics = async (
  dateFrom: string,
  dateTo: string
): Promise<DashboardAnalytics> => {
  const params = new URLSearchParams({ dateFrom, dateTo });
  const res = await fetch(
    `${API_URL}/superadmin/analytics/dashboard?${params}`,
    { method: "GET", headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Error al obtener analytics del dashboard");
  const json = await res.json();
  return json.data;
};

// ─── ADMIN — compone stats desde endpoints disponibles ────────────────────────

export interface AdminDashboardStats {
  totalStores: number;       // establecimientos del cliente
  totalOrders: number;       // pedidos del cliente
  totalPromoters: number;    // promotores globales
  activePromoters: number;   // promotores activos (b_active = true)
  heatmapPromoters: HeatmapPromoter[];
}

export const getAdminDashboardStats = async (
  id_client: number
): Promise<AdminDashboardStats> => {
  const [storesRes, promotersRes, ordersRes] = await Promise.allSettled([
    fetch(`${API_URL}/admin/stores/${id_client}`, { headers: authHeaders() }),
    fetch(`${API_URL}/admin/promoters`, { headers: authHeaders() }),
    fetch(`${API_URL}/admin/orders/client/${id_client}`, { headers: authHeaders() }),
  ]);

  // Establecimientos
  let totalStores = 0;
  if (storesRes.status === "fulfilled" && storesRes.value.ok) {
    const j = await storesRes.value.json();
    totalStores = Array.isArray(j.data) ? j.data.length : 0;
  }

  // Promotores (globales) + heatmap
  let totalPromoters = 0;
  let activePromoters = 0;
  let heatmapPromoters: HeatmapPromoter[] = [];
  if (promotersRes.status === "fulfilled" && promotersRes.value.ok) {
    const j = await promotersRes.value.json();
    const list: any[] = Array.isArray(j.data) ? j.data : [];
    totalPromoters = list.length;
    activePromoters = list.filter((p) => p.b_active).length;
    heatmapPromoters = list
      .filter((p) => p.f_latitude != null && p.f_longitude != null
                  && Number(p.f_latitude) !== 0 && Number(p.f_longitude) !== 0)
      .map((p) => ({
        id_promoter: p.id_promoter,
        vc_name: p.vc_name,
        f_latitude: Number(p.f_latitude),
        f_longitude: Number(p.f_longitude),
      }));
  }

  // Pedidos del cliente
  let totalOrders = 0;
  if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
    const j = await ordersRes.value.json();
    totalOrders = Array.isArray(j.data) ? j.data.length : 0;
  }

  return { totalStores, totalOrders, totalPromoters, activePromoters, heatmapPromoters };
};