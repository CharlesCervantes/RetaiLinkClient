import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Pregunta {
    id_pregunta?: number;
    vc_pregunta: string;
    vc_tipo: string; // tipo de pregunta, puede ser 'text', 'number', 'date', etc.
    b_evidencia: boolean; // si es true se espera una evidencia, si es false no se espera evidencia
    b_requerido: boolean; // si es true la pregunta es requerida, si es false la pregunta no es requerida
    dt_registro?: number; // fecha de registro
    dt_actualizacion?: number; // fecha de actualizacion
    b_estatus?: boolean; // si es true la pregunta esta activa, si es false la pregunta esta inactiva
}

export interface PreguntaNegocio {
    id_pregunta: number;
    id_negocio: number;
    dc_precio: number;
    b_activo: number;
    vc_pregunta: string;
    vc_tipo: string;
    b_photo: number;
    b_required: number;
    b_estatus: boolean;
    dt_registro?: number;
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

// Crear una nueva pregunta
export const createPregunta = async (pregunta: Pregunta): Promise<ApiResponse<{ id_pregunta: number }>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/create-pregunta`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(pregunta),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear pregunta');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en createPregunta:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener una pregunta por ID
export const getPreguntaById = async (id: number): Promise<ApiResponse<Pregunta>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/get-pregunta/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener pregunta');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getPreguntaById:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener todas las preguntas
export const getAllPreguntas = async (): Promise<ApiResponse<Pregunta[]>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/get-all-preguntas`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener preguntas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getAllPreguntas:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Actualizar una pregunta
export const updatePregunta = async (id: number, pregunta: Partial<Pregunta>): Promise<ApiResponse<null>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/update-pregunta/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(pregunta),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar pregunta');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en updatePregunta:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Eliminar una pregunta (eliminación lógica)
export const deletePregunta = async (id: number): Promise<ApiResponse<null>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/delete-pregunta/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar pregunta');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en deletePregunta:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener preguntas por tipo
export const getPreguntasByTipo = async (tipo: string): Promise<ApiResponse<Pregunta[]>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/get-preguntas-por-tipo/${tipo}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener preguntas por tipo');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getPreguntasByTipo:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener preguntas por evidencia
export const getPreguntasByEvidencia = async (evidencia: boolean): Promise<ApiResponse<Pregunta[]>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/get-preguntas-por-evidencia/${evidencia}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener preguntas por evidencia');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getPreguntasByEvidencia:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
};

// Obtener preguntas por negocio
export const getPreguntasByNegocio = async(id_negocio: number): Promise<ApiResponse<PreguntaNegocio[]>> => {
    try {
        const response = await fetch(`${API_URL}/superadmin/get-preguntas-negocio/${id_negocio}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener preguntas por megocio');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en getPreguntasByEvidencia:', error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}