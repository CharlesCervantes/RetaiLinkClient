import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface CreateOrderPayload {
  id_user: number;
  id_client: number;
  id_request: number;
  stores: number[]; 
}

export interface TaskData {
  id_task: number;
  id_store: number;
  id_promoter: number | null;
  dt_register: string;
  id_status: number;
  store_name: string;
  street: string;
  neighborhood: string;
  ext_number: string;
  promoter_name: string | null;
}

export interface OrderData {
  id_order: number;
  id_user: number;
  id_client: number;
  id_request: number;
  f_total: number;
  dt_register: string;
  id_status: number;
  request_name: string;
  total_tasks?: number; // Viene en la lista
  tasks?: TaskData[];   // Viene en el detalle
}

const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  const res = await fetch(`${API_URL}/admin/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al crear el pedido");
  }
  return res.json();
};

// GET: Obtener pedidos por cliente
export const getOrdersByClient = async (id_client: number) => {
  const res = await fetch(`${API_URL}/admin/orders/client/${id_client}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener los pedidos");
  return res.json();
};

// GET: Obtener detalle del pedido y sus tareas
export const getOrderById = async (id_order: number) => {
  const res = await fetch(`${API_URL}/admin/orders/${id_order}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener el detalle del pedido");
  return res.json();
};

// Agrega esto en Fetch/orders.ts (o donde prefieras)
export const assignPromoterTask = async (id_task: number, id_promoter: number) => {
  const res = await fetch(`${API_URL}/admin/tasks/${id_task}/assign`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ id_promoter }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Error al asignar promotor");
  }
  return res.json();
};