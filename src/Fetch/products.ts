import { useAuthStore } from "../store/authStore";
const API_URL = import.meta.env.VITE_API_URL;

export const getAllProducts = async () => {
    const token = useAuthStore.getState().token;
    const id_negocio = useAuthStore.getState().idNegocio;
  
    const res = await fetch(`${API_URL}/admin/get-all-products`, {
      method: "POST",  // porque el backend espera POST
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id_negocio }),
    });
  
  
    if (!res.ok) throw new Error("Error al obtener productos");
    return res.json();
  };
  
  
  export const createProduct = async (
    name: string,
    description: string,
    id_negocio: number,
    token: string
  ) => {
    const res = await fetch(`${API_URL}/admin/create-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        vc_nombre: name,
        vc_descripcion: description,
        id_negocio
      }),
    });
  
    if (!res.ok) throw new Error("Error al crear producto");
    return res.json();
  };
  
  
