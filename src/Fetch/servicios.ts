import api from "../lib/api";


export interface Status {
    id_status: number;
    vc_name: string;
    vc_description?: string;
    id_client: number;
    i_status: boolean;
    i_order: number;
    dt_register: string;
    dt_updated?: string;
}

export interface Servicio {
    id_service: number;
    vc_folio: string;
    id_client: number;
    id_user: number;
    id_status: number;
    dt_created: string;
    dt_updated: string;
}

export interface ApiResponse<T> {
    ok: boolean;
    data: T | null;
    message: string;
}

export interface CreateServicePayload {
    id_client: number;
    id_user: number;
}

// PETICIONES
export const fetchCrearServicio = async (servicio: Partial<CreateServicePayload>): Promise<ApiResponse<number>> => {
    try {
        const response = await api.post<ApiResponse<number>>(`/admin/service`, {
            id_client: servicio.id_client,
            id_user: servicio.id_user
        });

        console.log("response fetchCrearServicio: ", response);

        // Validar que response.data existe
        if (!response.data) {
            throw new Error("No se recibió respuesta del servidor");
        }

        if (!response.ok) {
            throw new Error(response.message || "Error desconocido");
        }

        return response;
    } catch (error) {
        console.error("fetchCrearServicio: ", error);
        return {
            ok: false,
            data: null,
            message: error instanceof Error ? error.message : "Error al crear el servicio"
        };
    }
}