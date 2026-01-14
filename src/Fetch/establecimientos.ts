import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Establecimiento {
    id_establecimiento?: number;
    vc_nombre: string;
    vc_direccion?: string;
    vc_num_economico?: string; // numero de serie o identificador del establecimiento
    vc_telefono?: string;
    vc_marca?: string; // marca del establecimiento
    i_latitud?: number; // latitud del establecimiento
    i_longitud?: number; // longitud del establecimiento
    b_estatus?: boolean; // estado del establecimiento
    dt_registro?: number; // fecha de registro
    dt_actualizacion?: number; // fecha de actualizacion
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
    latitude: number,
    longitude: number,
}

export interface ApiResponse<T> {
    ok: boolean;
    data: T | null;
    message: string;
}

// Headers con autenticación
const getAuthHeaders = () => {
    const token = useAuthStore.getState().token;
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as HeadersInit;
};

// Crear un nuevo establecimiento
export const createEstablecimiento = async (establecimiento: Establecimiento): Promise<ApiResponse<{ id: number }>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/create-establecimiento`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ establecimiento }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear establecimiento');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en createEstablecimiento:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener un establecimiento por ID
export const getEstablecimientoById = async (id: number): Promise<ApiResponse<Establecimiento>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/get-establecimiento/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener establecimiento');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getEstablecimientoById:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener todos los establecimientos
export const getAllEstablecimientos = async (search?: string): Promise<ApiResponse<Establecimiento[]>> => {
    try {
        const url = new URL(`${API_URL}/superadmin/get-all-establecimientos`);
        if (search) {
            url.searchParams.append('search', search);
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener establecimientos');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getAllEstablecimientos:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Actualizar un establecimiento
export const updateEstablecimiento = async (id: number, establecimiento: Partial<Establecimiento>): Promise<ApiResponse<Establecimiento>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/update-establecimiento/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ establecimiento }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar establecimiento');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updateEstablecimiento:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Eliminar un establecimiento (eliminación lógica)
export const deleteEstablecimiento = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/delete-establecimiento/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar establecimiento');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en deleteEstablecimiento:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Buscar establecimientos
export const searchEstablecimientos = async (searchTerm: string): Promise<ApiResponse<Establecimiento[]>> => {
    return getAllEstablecimientos(searchTerm);
};

// ------------------------------------- NUEVAS PETICIONES
export const createStorepayload = async (payload: CreateStorepayload) => {
    try {
        const response = await fetch(`${API_URL}/admin/store`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    
        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : await response.text();
    
            console.error("CreateStore error payload:", data);
            throw new Error( typeof data === "string" ? data : data?.details || data?.message || "Error al crear producto");
        }
    
        return response.json();
    } catch (error) {
        return  error
    }
}

export const getStoresForClient = async (id_client: number) => {
    try {
        const response = await fetch(`${API_URL}/admin/stores/${id_client}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
    
        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : await response.text();
    
            console.error("GetStores error:", data);
            throw new Error(typeof data === "string" ? data : data?.details || data?.message || "Error al obtener establecimientos");
        }
    
        return response.json();
    } catch (error) {
        console.error("Error en getStoresForClient:", error);
        throw error;
    }
}

export const getStoreClientById = async (id_store_client: number) => {
    try {
        const response = await fetch(`${API_URL}/admin/store-client/${id_store_client}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : await response.text();
            console.error("GetStoreClient error:", data);
            throw new Error(typeof data === "string" ? data : data?.details || data?.message || "Error al obtener establecimiento");
        }

        return response.json();
    } catch (error) {
        console.error("Error en getStoreClientById:", error);
        throw error;
    }
}

export const updateStoreClient = async (id_store_client: number, payload: CreateStorepayload) => {
    try {
        const response = await fetch(`${API_URL}/admin/store-client/${id_store_client}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : await response.text();
            console.error("UpdateStoreClient error:", data);
            throw new Error(typeof data === "string" ? data : data?.details || data?.message || "Error al actualizar establecimiento");
        }

        return response.json();
    } catch (error) {
        console.error("Error en updateStoreClient:", error);
        throw error;
    }
}

export const deleteStoreClient = async (id_store_client: number) => {
    try {
        const response = await fetch(`${API_URL}/admin/store-client/${id_store_client}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : await response.text();
            console.error("deleteStoreClient error:", data);
            throw new Error(typeof data === "string" ? data : data?.details || data?.message || "Error al actualizar establecimiento");
        }

        return response.json();
    } catch (error) {
        console.error("Error en deleteStoreClient:", error);
        throw error;
    }
}

export const uploadStoresFromExcel = async (id_client: number, id_user: number, file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_client", id_client.toString());
        formData.append("id_user", id_user.toString());

        const response = await fetch(`${API_URL}/admin/stores/import-excel`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await response.json() : await response.text();
            console.error("Upload Excel error:", data);
            throw new Error(typeof data === "string" ? data : data?.details || data?.message || "Error al procesar Excel");
        }

        return response.json();
    } catch (error) {
        console.error("Error en uploadStoresFromExcel:", error);
        throw error;
    }
}
