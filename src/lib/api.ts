import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiError {
    message?: string;
    details?: string;
}

/**
 * Cliente API centralizado con manejo de autenticación
 */
export const api = {
    /**
     * Obtiene los headers con autenticación
     */
    getAuthHeaders(): HeadersInit {
        const token = useAuthStore.getState().token;
        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    },

    /**
     * Realiza una petición GET autenticada
     */
    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<T>(response);
    },

    /**
     * Realiza una petición POST autenticada
     */
    async post<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });

        return this.handleResponse<T>(response);
    },

    /**
     * Realiza una petición PUT autenticada
     */
    async put<T>(endpoint: string, body?: unknown): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "PUT",
            headers: this.getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });

        return this.handleResponse<T>(response);
    },

    /**
     * Realiza una petición DELETE autenticada
     */
    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });

        return this.handleResponse<T>(response);
    },

    /**
     * Sube un archivo con FormData (autenticado)
     */
    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
        const token = useAuthStore.getState().token;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });

        return this.handleResponse<T>(response);
    },

    /**
     * Maneja la respuesta de la API
     */
    async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const data: ApiError = contentType.includes("application/json")
                ? await response.json()
                : { message: await response.text() };

            console.error(`API Error [${response.status}]:`, data);
            throw new Error(data.details || data.message || `Error ${response.status}`);
        }

        return response.json();
    },
};

export default api;
