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
  const res = await fetch(`${API_URL}/superadmin/create-client`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al registrar cliente");
  
  return res.json();
};
