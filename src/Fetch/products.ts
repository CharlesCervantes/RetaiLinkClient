import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL;

interface CreateProductParams {
  id_user: number;
  id_client: number;
  name: string;
  description?: string;
  vc_image?: string;
}

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
  const response = await fetch(`${API_URL}/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Error al crear producto");
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
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("id_client", String(id_client));

  const response = await fetch(`${API_URL}/admin/products/${id_product}/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Error al subir imagen");
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

