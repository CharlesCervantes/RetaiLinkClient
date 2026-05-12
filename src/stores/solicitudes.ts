// store/useSolicitudStore.ts
import { create } from "zustand"

interface ProductoSeleccionado {
  id: string
  nombre: string
  imagenes: string[]
  preguntas: { id: string | number; texto: string; precio: number }[]
}

interface SolicitudState {
  productos: ProductoSeleccionado[]
  sucursales: string[] // o IDs
  agregarProducto: (producto: ProductoSeleccionado) => void
  eliminarProducto: (id: string) => void
  setSucursales: (sucursales: string[]) => void
  limpiarSolicitud: () => void
  calcularPrecioTotal: () => number
}

export const useSolicitudStore = create<SolicitudState>((set, get) => ({
  productos: [],
  sucursales: [],
  agregarProducto: (producto) =>
    set((state) => ({ productos: [...state.productos, producto] })),

  eliminarProducto: (id) => set((state) => ({
    productos: state.productos.filter((p) => p.id !== id)
  })),

  setSucursales: (sucursales) => set({ sucursales }),

  limpiarSolicitud: () => set({ productos: [], sucursales: [] }),

  calcularPrecioTotal: () => {
    const base = 45
    const totalPreguntas = get().productos.reduce((sum, p) => sum + p.preguntas.length, 0)
    const preguntasExtra = Math.max(totalPreguntas - 3, 0)
    const costoExtra = preguntasExtra * 15
    return Math.min(base + costoExtra, 90)
  }
}))
