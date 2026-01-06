import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CreateProductParams {
  id_user: number;
  id_client: number;
  name: string;
  description?: string;
  vc_image?: string;
}

// Quita el prefijo base64 de la imagen para que el backend la acepte
const cleanBase64 = (s?: string) =>
  (s ?? "").includes("base64,") ? (s ?? "").split("base64,")[1] : (s ?? "");

export const getAllProducts = async () => {
    const token = useAuthStore.getState().token;
    const id_negocio = useAuthStore.getState().id_client;
  
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
  
  
  export const createProduct = async (params: CreateProductParams) => {
    const payload: CreateProductParams = {
      ...params,
      name: params.name.trim(),
      description: params.description ?? "",
      vc_image: cleanBase64(params.vc_image),
    };
  
    // Validaciones
    if (!payload.id_user) throw new Error("Falta id_user");
    if (!payload.id_client) throw new Error("Falta id_client");
    if (!payload.name) throw new Error("Falta nombre del producto");
  
    const response = await fetch(`${API_URL}/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
  
      console.error("CreateProduct error payload:", data);
      throw new Error(
        typeof data === "string" ? data : data?.details || data?.message || "Error al crear producto"
      );
    }
  
    return response.json();
  };
  

export const getProductsByClient = async (id_client: number) => {
  const response = await fetch(`${API_URL}/admin/products/client/${id_client}`);

  if (!response.ok) {
    throw new Error("Error al obtener productos");
  }

  return response.json();
};

export const getProductById = async (id_product: number) => {
  const response = await fetch(`${API_URL}/admin/products/${id_product}`);

  if (!response.ok) {
    throw new Error("Error al obtener producto");
  }

  return response.json();
};
  

export const uploadProductImage = async (
  id_product: number,
  id_client: number,
  imageFile: File
) => {
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error("Sesión inválida: no hay token");
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("id_client", String(id_client));

  const response = await fetch(`${API_URL}/admin/products/${id_product}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NO pongas Content-Type con FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    throw new Error(
      typeof data === "string"
        ? data
        : data?.details || data?.message || "Error al subir imagen"
    );
  }

  return response.json();
};


export const updateProduct = async (
  id_product: number,
  data: { name?: string; description?: string }
) => {
  const response = await fetch(`${API_URL}/admin/products/${id_product}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Error al actualizar producto");
  }

  return response.json();
};

export const deleteProduct = async (id_product: number) => {
  const response = await fetch(`${API_URL}/admin/products/${id_product}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Error al eliminar producto");
  }

  return response.json();
};

