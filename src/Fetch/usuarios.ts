import { api, ApiResponse } from "../lib/api";

export interface Usuario {
  id_usuario: number;
  vc_nombre: string;
  vc_username: string;
  vc_password?: string;
  vc_telefono?: string;
  b_activo?: boolean;
  dt_registro?: number;
  dt_actualizacion?: number;
  id_negocio: number;
  i_rol?: number;
}

export interface ClientUser {
  id_user: number;
  email: string;
  i_rol: number;
  i_status: number;
  dt_register: string;
  dt_updated: string;
  name: string;
  lastname: string;
  id_client: number;
  id_user_creator: number;
}

// POST: registrar usuario en cliente
export const registerUserInClient = async (payload: {
  name: string;
  lastname: string;
  email: string;
  password: string;
  i_rol: number;
  id_user_creator: number;
  id_client: number;
}): Promise<ApiResponse<ClientUser>> => {
  return api.post<ApiResponse<ClientUser>>("/users/", payload);
};

// GET: obtener usuarios por negocio
export const getUsersByBusiness = async (id_negocio: number): Promise<ApiResponse<Usuario[]>> => {
  return api.post<ApiResponse<Usuario[]>>("/admin/get-users-by-business", { id_negocio });
};

// GET: obtener usuarios por cliente (SuperAdmin)
export const getUsersByIdClient = async (id_client: number): Promise<ApiResponse<ClientUser[]>> => {
  return api.get<ApiResponse<ClientUser[]>>(`/users/${id_client}`);
};
