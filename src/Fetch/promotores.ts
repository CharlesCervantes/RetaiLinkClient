import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface Promotor {
  id_promoter: number;
  vc_name: string;
  vc_email: string;
  vc_phone?: string;
  b_active: boolean;
  dt_register?: string;
}

const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
};


export const getAllPromoters = async () => {
  const res = await fetch(`${API_URL}/admin/promoters`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener promotores");
  return res.json();
};