// src/store/productStore.ts
import { create } from "zustand"

type FrontProducto = {
  id_producto: number
  name: string
  description?: string
  images: string[] // usamos array aunque en BD tengas solo 1 url
}

type State = {
  products: FrontProducto[]

  // form state
  name: string
  description: string
  imageUrl: string

  // negocio actual (ajústalo según tu app; puede venir de otro store o del query param)
  negocioId: number

  // ui
  loading: boolean

  // actions
  setName: (v: string) => void
  setDescription: (v: string) => void
  setImageUrl: (v: string) => void
  setNegocioId: (id: number) => void

  fetchProducts: () => Promise<void>
  addProduct: () => Promise<void>
  resetForm: () => void
}

export const useProductStore = create<State>((set, get) => ({
  products: [],

  name: "",
  description: "",
  imageUrl: "",

  negocioId: 1, // <-- valor por defecto; cámbialo donde corresponda
  loading: false,

  setName: (v) => set({ name: v }),
  setDescription: (v) => set({ description: v }),
  setImageUrl: (v) => set({ imageUrl: v }),
  setNegocioId: (id) => set({ negocioId: id }),

  // GET /negocios/:id/productos
  fetchProducts: async () => {
    const { negocioId } = get()
    set({ loading: true })
    try {
      const res = await fetch(`/api/negocios/${negocioId}/productos`)
      if (!res.ok) throw new Error("No se pudo obtener productos")
      const data = await res.json()

      // mapeo back -> front
      const mapped: FrontProducto[] = (data as any[]).map((r) => ({
        id_producto: r.id_producto,
        name: r.name ?? r.vc_nombre, // por si ya mapeaste en el back
        description: r.description ?? r.vc_descripcion ?? "",
        images: r.images ?? (r.vc_image_url ? [r.vc_image_url] : []),
      }))

      set({ products: mapped })
    } finally {
      set({ loading: false })
    }
  },

  // POST /productos
  addProduct: async () => {
    const { name, description, imageUrl, negocioId, products } = get()
    // validar mínimo requerido
    if (!name.trim()) throw new Error("El nombre es obligatorio")

    // IMPORTANTE: el back espera vc_* e id_negocio; y null (no undefined)
    const body = {
      id_negocio: negocioId,
      vc_nombre: name.trim(),
      vc_descripcion: description?.trim() || null,
      vc_image_url: imageUrl?.trim() || null,
    }

    set({ loading: true })
    try {
      const res = await fetch(`/api/productos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const detail = await res.text().catch(() => "")
        throw new Error(`Error al crear producto. ${detail}`)
      }
      const json = await res.json() // espera { id_producto }
      const id_producto: number = json.id_producto ?? json.id ?? 0

      // reflejar en memoria con shape del front
      const nuevo: FrontProducto = {
        id_producto,
        name: body.vc_nombre,
        description: body.vc_descripcion ?? "",
        images: body.vc_image_url ? [body.vc_image_url] : [],
      }
      set({
        products: [nuevo, ...products],
      })
    } finally {
      set({ loading: false })
    }
  },

  resetForm: () => set({ name: "", description: "", imageUrl: "" }),
}))
