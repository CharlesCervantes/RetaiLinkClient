import { api } from "../lib/api";

// Interface para Store (usado en vistas)
export interface Store {
    id_store: number;
    id_store_client?: number;
    id_client?: number;
    id_user?: number;
    id_user_creator?: number;
    i_status: boolean;
    dt_register: string;
    dt_updated: string;
    name: string;
    store_code: string;
    street: string;
    ext_number: string;
    int_number: string;
    neighborhood: string;
    municipality: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
}

// Interface legacy para compatibilidad con componentes antiguos
export interface Establecimiento {
    id_establecimiento?: number;
    vc_nombre: string;
    vc_direccion?: string;
    vc_num_economico?: string;
    vc_telefono?: string;
    vc_marca?: string;
    i_latitud?: number;
    i_longitud?: number;
    b_estatus?: boolean;
    dt_registro?: number;
    dt_actualizacion?: number;
}

export interface CreateStorepayload {
    id_client: number;
    id_user_creator: number;
    name: string;
    store_code: string;
    street: string;
    ext_number: string;
    int_number: string;
    neighborhood: string;
    municipality: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
}

export interface ApiResponse<T> {
    ok: boolean;
    data: T | null;
    message: string;
}

// -------------------------------------- SUPERADMIN

export const getStores = async (): Promise<ApiResponse<Store[]>> => {
    return api.get<ApiResponse<Store[]>>("/superadmin/stores");
};

export const getStoreById = async (id_store: number): Promise<ApiResponse<Store>> => {
    return api.get<ApiResponse<Store>>(`/superadmin/stores/${id_store}`);
};

// Eliminar store (SuperAdmin)
export const deleteStore = async (id_store: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/superadmin/stores/${id_store}`);
};

// ------------------------------------- NORMAL ADMIN

export const createStorepayload = async (payload: CreateStorepayload): Promise<ApiResponse<Store>> => {
    return api.post<ApiResponse<Store>>("/admin/store", payload);
};

export const getStoresForClient = async (id_client: number): Promise<ApiResponse<Store[]>> => {
    return api.get<ApiResponse<Store[]>>(`/admin/stores/${id_client}`);
};

export const getStoreClientById = async (id_store_client: number): Promise<ApiResponse<Store>> => {
    return api.get<ApiResponse<Store>>(`/admin/store-client/${id_store_client}`);
};

export const updateStoreClient = async (
    id_store_client: number,
    payload: CreateStorepayload
): Promise<ApiResponse<Store>> => {
    return api.put<ApiResponse<Store>>(`/admin/store-client/${id_store_client}`, payload);
};

export const deleteStoreClient = async (id_store_client: number): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(`/admin/store-client/${id_store_client}`);
};

export const uploadStoresFromExcel = async (
    id_client: number,
    id_user: number,
    file: File
): Promise<ApiResponse<{ success: number; failed: number; errors?: unknown[] }>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_client", id_client.toString());
    formData.append("id_user", id_user.toString());

    return api.upload<ApiResponse<{ success: number; failed: number }>>("/admin/stores/import-excel", formData);
};
