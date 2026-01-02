const API_URL = import.meta.env.VITE_API_URL;

interface ClientData {
  id_user: number;
  name: string;
  rfc?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  addiccional_notes?: string;
}

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