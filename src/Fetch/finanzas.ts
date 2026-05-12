import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pagado" | "pendiente" | "vencido";
export type PromoterPaymentStatus = "pagado" | "pendiente";
export type MetodoPago = "efectivo" | "transferencia" | "tarjeta" | "oxxo";

export interface RegistrarPagoPayload {
  dt_pago: string;
  metodo_pago: MetodoPago;
  referencia?: string;
  notas?: string;
}

export interface CobroPedido {
  id_cobro: number;
  id_order: number;
  id_client: number;
  client_name: string;
  request_name: string;
  f_total: number;
  f_pagado: number;
  f_pendiente: number;
  dt_vencimiento: string;
  dt_pago: string | null;
  status: PaymentStatus;
}

export interface PagoPromotor {
  id_pago: number;
  id_promoter: number;
  promoter_name: string;
  id_order: number;
  request_name: string;
  f_monto: number;
  dt_periodo_inicio: string;
  dt_periodo_fin: string;
  dt_pago: string | null;
  status: PromoterPaymentStatus;
}

export interface MiPago {
  id_pago: number;
  id_order: number;
  request_name: string;
  client_name: string;
  f_monto: number;
  dt_periodo_inicio: string;
  dt_periodo_fin: string;
  dt_pago: string | null;
  status: PromoterPaymentStatus;
}

export interface ResumenFinanzas {
  total_cobrado: number;
  total_pendiente_cobro: number;
  total_pagado_promotores: number;
  total_pendiente_promotores: number;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_COBROS: CobroPedido[] = [
  {
    id_cobro: 1,
    id_order: 101,
    id_client: 1,
    client_name: "Bimbo S.A. de C.V.",
    request_name: "Auditoría Punto de Venta Q1",
    f_total: 45000,
    f_pagado: 45000,
    f_pendiente: 0,
    dt_vencimiento: "2025-01-31",
    dt_pago: "2025-01-28",
    status: "pagado",
  },
  {
    id_cobro: 2,
    id_order: 102,
    id_client: 2,
    client_name: "PepsiCo México",
    request_name: "Campaña Exhibición Feb",
    f_total: 32500,
    f_pagado: 0,
    f_pendiente: 32500,
    dt_vencimiento: "2025-02-15",
    dt_pago: null,
    status: "vencido",
  },
  {
    id_cobro: 3,
    id_order: 103,
    id_client: 1,
    client_name: "Bimbo S.A. de C.V.",
    request_name: "Revisión Precios Marzo",
    f_total: 18000,
    f_pagado: 0,
    f_pendiente: 18000,
    dt_vencimiento: "2025-03-30",
    dt_pago: null,
    status: "pendiente",
  },
  {
    id_cobro: 4,
    id_order: 104,
    id_client: 3,
    client_name: "Nestlé México",
    request_name: "Auditoría Distribución Q1",
    f_total: 60000,
    f_pagado: 60000,
    f_pendiente: 0,
    dt_vencimiento: "2025-02-28",
    dt_pago: "2025-02-25",
    status: "pagado",
  },
  {
    id_cobro: 5,
    id_order: 105,
    id_client: 2,
    client_name: "PepsiCo México",
    request_name: "Verificación Góndola Abril",
    f_total: 27500,
    f_pagado: 0,
    f_pendiente: 27500,
    dt_vencimiento: "2025-04-15",
    dt_pago: null,
    status: "pendiente",
  },
];

const MOCK_PAGOS_PROMOTORES: PagoPromotor[] = [
  {
    id_pago: 1,
    id_promoter: 10,
    promoter_name: "Carlos Ramírez",
    id_order: 101,
    request_name: "Auditoría Punto de Venta Q1",
    f_monto: 4500,
    dt_periodo_inicio: "2025-01-01",
    dt_periodo_fin: "2025-01-31",
    dt_pago: "2025-02-05",
    status: "pagado",
  },
  {
    id_pago: 2,
    id_promoter: 11,
    promoter_name: "María López",
    id_order: 101,
    request_name: "Auditoría Punto de Venta Q1",
    f_monto: 3800,
    dt_periodo_inicio: "2025-01-01",
    dt_periodo_fin: "2025-01-31",
    dt_pago: "2025-02-05",
    status: "pagado",
  },
  {
    id_pago: 3,
    id_promoter: 12,
    promoter_name: "Jorge Hernández",
    id_order: 103,
    request_name: "Revisión Precios Marzo",
    f_monto: 2200,
    dt_periodo_inicio: "2025-03-01",
    dt_periodo_fin: "2025-03-31",
    dt_pago: null,
    status: "pendiente",
  },
  {
    id_pago: 4,
    id_promoter: 10,
    promoter_name: "Carlos Ramírez",
    id_order: 105,
    request_name: "Verificación Góndola Abril",
    f_monto: 3100,
    dt_periodo_inicio: "2025-04-01",
    dt_periodo_fin: "2025-04-30",
    dt_pago: null,
    status: "pendiente",
  },
  {
    id_pago: 5,
    id_promoter: 13,
    promoter_name: "Ana Torres",
    id_order: 104,
    request_name: "Auditoría Distribución Q1",
    f_monto: 5500,
    dt_periodo_inicio: "2025-02-01",
    dt_periodo_fin: "2025-02-28",
    dt_pago: "2025-03-03",
    status: "pagado",
  },
];

const MOCK_MIS_PAGOS: MiPago[] = [
  {
    id_pago: 1,
    id_order: 101,
    request_name: "Auditoría Punto de Venta Q1",
    client_name: "Bimbo S.A. de C.V.",
    f_monto: 4500,
    dt_periodo_inicio: "2025-01-01",
    dt_periodo_fin: "2025-01-31",
    dt_pago: "2025-02-05",
    status: "pagado",
  },
  {
    id_pago: 4,
    id_order: 105,
    request_name: "Verificación Góndola Abril",
    client_name: "PepsiCo México",
    f_monto: 3100,
    dt_periodo_inicio: "2025-04-01",
    dt_periodo_fin: "2025-04-30",
    dt_pago: null,
    status: "pendiente",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const USE_MOCK = true; // Cambiar a false al integrar la API real

const authHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ─── SUPER ADMIN: COBROS DE PEDIDOS ──────────────────────────────────────────

export const getCobros = async (): Promise<{ ok: boolean; data: CobroPedido[] }> => {
  if (USE_MOCK) {
    await delay();
    return { ok: true, data: MOCK_COBROS };
  }
  const res = await fetch(`${API_URL}/superadmin/finanzas/cobros`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener cobros");
  return res.json();
};

export const marcarCobroPagado = async (
  id_cobro: number,
  payload: RegistrarPagoPayload
): Promise<{ ok: boolean }> => {
  if (USE_MOCK) {
    await delay(400);
    return { ok: true };
  }
  const res = await fetch(`${API_URL}/superadmin/finanzas/cobros/${id_cobro}/pagar`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al marcar cobro como pagado");
  return res.json();
};

// ─── SUPER ADMIN: PAGOS A PROMOTORES ─────────────────────────────────────────

export const getPagosPromotores = async (): Promise<{ ok: boolean; data: PagoPromotor[] }> => {
  if (USE_MOCK) {
    await delay();
    return { ok: true, data: MOCK_PAGOS_PROMOTORES };
  }
  const res = await fetch(`${API_URL}/superadmin/finanzas/pagos-promotores`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener pagos de promotores");
  return res.json();
};

export const marcarPagoPromotorPagado = async (
  id_pago: number,
  payload: RegistrarPagoPayload
): Promise<{ ok: boolean }> => {
  if (USE_MOCK) {
    await delay(400);
    return { ok: true };
  }
  const res = await fetch(`${API_URL}/superadmin/finanzas/pagos-promotores/${id_pago}/pagar`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al marcar pago como realizado");
  return res.json();
};

// ─── ADMIN: MIS PAGOS ─────────────────────────────────────────────────────────

export const getMisPagos = async (id_promoter: number): Promise<{ ok: boolean; data: MiPago[] }> => {
  if (USE_MOCK) {
    await delay();
    return { ok: true, data: MOCK_MIS_PAGOS };
  }
  const res = await fetch(`${API_URL}/admin/finanzas/mis-pagos/${id_promoter}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener mis pagos");
  return res.json();
};

// ─── RESUMEN ──────────────────────────────────────────────────────────────────

export const getResumenFinanzas = async (): Promise<{ ok: boolean; data: ResumenFinanzas }> => {
  if (USE_MOCK) {
    await delay(300);
    const data: ResumenFinanzas = {
      total_cobrado: MOCK_COBROS.filter((c) => c.status === "pagado").reduce((a, c) => a + c.f_total, 0),
      total_pendiente_cobro: MOCK_COBROS.filter((c) => c.status !== "pagado").reduce((a, c) => a + c.f_pendiente, 0),
      total_pagado_promotores: MOCK_PAGOS_PROMOTORES.filter((p) => p.status === "pagado").reduce((a, p) => a + p.f_monto, 0),
      total_pendiente_promotores: MOCK_PAGOS_PROMOTORES.filter((p) => p.status === "pendiente").reduce((a, p) => a + p.f_monto, 0),
    };
    return { ok: true, data };
  }
  const res = await fetch(`${API_URL}/superadmin/finanzas/resumen`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener resumen");
  return res.json();
};
