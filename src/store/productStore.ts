import { getAllProducts, createProduct } from "../Fetch/products";
import { useAuthStore } from "./authStore";
import { create } from "zustand";

interface Product {
  id_producto: number;
  vc_nombre: string;
  vc_descripcion: string;
  vc_image_url: string; // imagen para despues usar servidor de imagenes
  id_negocio: number;
}

interface ProductState {
  name: string;
  description: string;
  products: Product[];
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  addProduct: () => Promise<void>;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  name: "",
  description: "",
  products: [],
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  fetchProducts: async () => {
    try {
      const id_negocio = useAuthStore.getState().idNegocio;
      const token = useAuthStore.getState().token;
  
      if (!id_negocio || !token) {
        throw new Error("Faltan datos de autenticación");
      }
  
      const response = await getAllProducts();
      if (response.ok) {
        set({ products: response.data });
      }
    } catch (e) {
      console.error("Error al obtener productos", e);
    }
  },
  
  
  addProduct: async () => {
    const { name, description } = get();
    const id_negocio = useAuthStore.getState().idNegocio;
    const token = useAuthStore.getState().token;
  
    if (!id_negocio || !token) {
      throw new Error("Faltan datos de autenticación");
    }
  
    await createProduct(name, description, id_negocio, token);
  
    // recargar productos
    await get().fetchProducts(id_negocio);
  
    // limpiar campos
    set({ name: "", description: "" });
  },
  
}));


