import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL;

interface ClientData {
  id_user: number;
  name: string;
  rfc?: string;
  email?: string;
  phone?: string;
  id_pais?: number;
  id_estado?: number;
  id_ciudad?: number;
  street?: string;
  ext_number?: string;
  int_number?: string;
  neighborhood?: string;
  zip?: string;
  addiccional_notes?: string;
}

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

export const registClient = async (data: ClientData) => {
    try {
        const res = await fetch(`${API_URL}/superadmin/create-client`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Error al registrar cliente");
        
        return res.json();
    } catch (error) {
        console.error("f.registClient:", error);
    }
};

export const getCLientsList = async () => {
  try {
    const res = await fetch(`${API_URL}/superadmin/get_clients_list`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error al obtener la lista de clientes");

    return res.json();
  } catch (error) {
    console.error("f.getCLientsList:", error);
  }
};

export const getClientById = async (id: number) => {
    try {
        const res = await fetch(`${API_URL}/superadmin/get_client/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Error al obtener el cliente");

        return res.json();
    } catch (error) {
        console.error("f.getClientById:", error);
    }
}

export const updateClientFiscalDoc = async (id: number, url: string) => {
    try {
        const res = await fetch(`${API_URL}/superadmin/client/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ vc_url_situacion_fiscal: url }),
        });

        if (!res.ok) throw new Error("Error al actualizar el documento fiscal");

        return res.json();
    } catch (error) {
        console.error("f.updateClientFiscalDoc:", error);
        throw error;
    }
};

export const deleteCLientById = async (id: number) => {
    try{
        const res = await fetch(`${API_URL}/superadmin/client/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Error al eliminar el cliente");

        return res.json();
    } catch (error) {
        console.error("f.deleteCLientById:", error);
    }
}