import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

export interface Negocio {
  id_negocio: number;
  vc_nombre: string;
  b_activo?: boolean;
  dt_registro?: number;
  dt_actualizacion?: number;
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

// GET: lista de establecimientos
export const getAllNegocios = async (): Promise<ApiResponse<Negocio[]>> => {
  const res = await fetch(
    `${API_URL}/superadmin/get-all-negocios`,
    {
      method: "GET",
      headers: authHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al obtener negocios");
  return res.json();
};

// POST: crear establecimiento
export const createNegocio = async (
  nombre: string
): Promise<ApiResponse<{ negocio: { id_negocio: number; vc_nombre: string } }>> => {
  const res = await fetch(`${API_URL}/superadmin/create-negocio`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ negocio: { vc_nombre: nombre } }),
  });
  if (!res.ok) throw new Error("Error al crear negocio");
  return res.json();
};

// PUT: actualizar establecimiento
export const updateNegocio = async (
  id: number,
  updates: Partial<Pick<Negocio, "vc_nombre" | "b_activo">>
): Promise<ApiResponse<Negocio>> => {
  const res = await fetch(
    `${API_URL}/superadmin/update-negocio/${id}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ negocio: updates }),
    }
  );
  if (!res.ok) throw new Error("Error al actualizar negocio");
  return res.json();
};

// DELETE: eliminar establecimiento (lógico)
export const deleteNegocio = async (id: number): Promise<ApiResponse<null>> => {
  const res = await fetch(
    `${API_URL}/superadmin/delete-negocio/${id}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );
  if (!res.ok) throw new Error("Error al eliminar negocio");
  return res.json();
};
