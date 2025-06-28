// store/useSolicitudStore.ts
import { create } from "zustand"

interface ProductoSeleccionado {
  id: string
  nombre: string
  imagenes: string[]
  preguntas: { id: string; texto: string; precio: number }[]
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
    const extraProductos = Math.max(get().productos.length - 3, 0) * 15
    const extraPreguntas = get().productos.flatMap(p =>
      p.preguntas.filter(preg => preg.precio > 0)
    ).reduce((sum, preg) => sum + preg.precio, 0)
    return base + extraProductos + extraPreguntas
  }
}))
