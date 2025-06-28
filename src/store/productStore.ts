import { create } from 'zustand'

// Tipos
export interface Product {
  id: string
  name: string
  description: string
  images: File[]
}

interface ProductState {
  products: Product[]

  name: string
  description: string
  images: File[]

  setName: (name: string) => void
  setDescription: (desc: string) => void
  addImage: (file: File) => void
  removeImage: (index: number) => void

  addProduct: () => void
  resetForm: () => void
}

// LocalStorage helpers
const STORAGE_KEY = 'products'

const loadProductsFromStorage = (): Product[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const saveProductsToStorage = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: loadProductsFromStorage(),

  name: '',
  description: '',
  images: [],

  setName: (name) => set({ name }),
  setDescription: (desc) => set({ description: desc }),

  addImage: (file) => {
    const { images } = get()
    if (images.length >= 3) return
    set({ images: [...images, file] })
  },

  removeImage: (index) => {
    const { images } = get()
    const newImages = images.filter((_, i) => i !== index)
    set({ images: newImages })
  },

  addProduct: () => {
    const { name, description, images, products } = get()
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      description,
      images
    }

    const updatedProducts = [...products, newProduct]
    set({ products: updatedProducts })
    saveProductsToStorage(updatedProducts)
    get().resetForm()
  },

  resetForm: () => {
    set({ name: '', description: '', images: [] })
  },
  
}))
