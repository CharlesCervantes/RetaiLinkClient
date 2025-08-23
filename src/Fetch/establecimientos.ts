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