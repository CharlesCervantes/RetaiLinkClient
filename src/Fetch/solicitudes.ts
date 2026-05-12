import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

// --- INTERFACES BASADAS EN TU ESTRUCTURA ---
export interface QuestionPayload {
  id_pregunta: number;
  precio_aplicado: number;
}

export interface ProductPayload {
  id_product: number;
  subtotal: number;
  preguntas: QuestionPayload[];
}

export interface CreateRequestPayload {
  id_user: number;
  id_cliente: number;
  nombre_solicitud: string;
  costo_total: number;
  vc_image?: string;
  productos: ProductPayload[];
}

export interface RequestData {
  id_request: number;
  id_user: number;
  id_client?: number;
  vc_name: string;
  f_value: number;
  dt_register: string;
  dt_update: string;
  id_status: number;
  productos?: any[]; // Puedes tipar esto más detalladamente si lo necesitas luego
}

type ApiResponse<T> = {
  error?: boolean; // Hice este opcional por si tu backend no siempre lo manda
  ok: boolean;
  data: T;
  message?: string;
};

// Headers con autenticación
const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
};

// ==========================================
// MÉTODOS FETCH
// ==========================================

// 1. POST: Crear una nueva solicitud
export const createRequest = async (payload: CreateRequestPayload): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admin/requests`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al crear la solicitud");
  }
  return res.json();
};

// 2. GET: Obtener solicitudes por cliente
export const getRequestsByClient = async (id_client: number): Promise<ApiResponse<RequestData[]>> => {
  const res = await fetch(`${API_URL}/admin/requests/client/${id_client}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al obtener las solicitudes del cliente");
  }
  return res.json();
};

// 3. GET: Obtener detalle completo de una solicitud (con productos y preguntas)
export const getRequestById = async (id_request: number): Promise<ApiResponse<RequestData>> => {
  const res = await fetch(`${API_URL}/admin/requests/${id_request}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al obtener el detalle de la solicitud");
  }
  return res.json();
};

// 6. PUT: Actualizar solicitud completa (Wipe & Replace de productos y preguntas)
export const updateFullRequest = async (id_request: number, payload: CreateRequestPayload): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admin/requests/${id_request}/full`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al actualizar la solicitud completa");
  }
  return res.json();
};

// 5. DELETE: Eliminar solicitud (borrado lógico)
export const deleteRequest = async (id_request: number): Promise<ApiResponse<any>> => {
  const res = await fetch(`${API_URL}/admin/requests/${id_request}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al eliminar la solicitud");
  }
  return res.json();
};