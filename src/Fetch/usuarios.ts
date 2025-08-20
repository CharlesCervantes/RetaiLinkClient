import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface Usuario {
  id_usuario: number;
  vc_nombre: string;
  vc_username: string;
  vc_telefono?: string;
  b_activo?: boolean;
  dt_registro?: number;
  dt_actualizacion?: number;
  id_negocio: number;
}

type ApiResponse<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

const authHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as HeadersInit;
};

// GET: obtener usuarios por negocio
export const getUsersByBusiness = async (id_negocio: number): Promise<ApiResponse<Usuario[]>> => {
  const res = await fetch(
    `${API_URL}/admin/get-users-by-business`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ id_negocio }),
    }
  );
  if (!res.ok) throw new Error("Error al obtener usuarios del negocio");
  return res.json();
};