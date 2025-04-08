import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FieldType = "text" | "number" | "date" | "quality"

export interface FormField {
  id: string
  type: FieldType
  label: string
  requiresImage?: boolean
}

export interface FormImage {
  id: string
  file: File
  previewUrl: string
}

export interface Product {
  id: string
  name: string
  description?: string
  image?: FormImage
  fields: FormField[]
}

interface ProductState {
  products: Product[]
  addProduct: (product: Omit<Product, "id" | "fields" | "image">) => void
  updateProductImage: (productId: string, file: File) => void
  addFieldToProduct: (productId: string, field: Omit<FormField, "id">) => void
  deleteProduct: (productId: string) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],

      addProduct: (product) => {
        const newProduct: Product = {
          id: crypto.randomUUID(),
          ...product,
          fields: [],
        }
        set((state) => ({
          products: [...state.products, newProduct],
        }))
        return newProduct.id 
      },
      

      updateProductImage: (productId, file) => {
        const image: FormImage = {
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        }
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, image } : p
          ),
        }))
      },

      addFieldToProduct: (productId, field) => {
        const newField = { ...field, id: crypto.randomUUID() }
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? { ...p, fields: [...p.fields, newField] }
              : p
          ),
        }))
      },

      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),
    }),
    {
      name: "product-storage",
    }
  )
)
