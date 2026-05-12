import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface PerfilUsuario {
  id_user: number;
  email: string;
  name: string;
  lastname: string;
  i_rol: number;
  i_status: number;
  dt_register: string;
  dt_updated: string;
}

export interface UpdateProfilePayload {
  name: string;
  lastname: string;
}

export interface UpdateEmailPayload {
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const authHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── ENDPOINTS ────────────────────────────────────────────────────────────────

/** GET /admin/profile — perfil del usuario autenticado */
export const getPerfil = async (): Promise<{ ok: boolean; data: PerfilUsuario }> => {
  const res = await fetch(`${API_URL}/admin/profile`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener el perfil");
  return res.json();
};

/** PUT /admin/users/:id/profile — actualizar nombre y apellido */
export const updateProfile = async (
  id: number,
  payload: UpdateProfilePayload
): Promise<{ ok: boolean }> => {
  const res = await fetch(`${API_URL}/admin/users/${id}/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al actualizar el perfil");
  return res.json();
};

/** PUT /admin/users/:id/email — actualizar email */
export const updateEmail = async (
  id: number,
  payload: UpdateEmailPayload
): Promise<{ ok: boolean }> => {
  const res = await fetch(`${API_URL}/admin/users/${id}/email`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al actualizar el email");
  return res.json();
};

/** POST /admin/change-password — cambiar contraseña con la actual */
export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<{ ok: boolean }> => {
  const res = await fetch(`${API_URL}/admin/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || "Error al cambiar la contraseña");
  }
  return res.json();
};
