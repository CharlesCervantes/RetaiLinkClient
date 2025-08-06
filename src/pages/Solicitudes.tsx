import { useProductStore } from "../store/productStore";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";

// Tipo de solicitud (mock mientras no hay backend)
interface Solicitud {
  id: string
  nombre: string
  tiendas: number
  productos: { nombre: string; cantidad: number }[]
  preguntas: string[]
  estatus: "Pendiente" | "En progreso" | "Completada"
}

export default function CrearSolicitud() {
  const navigate = useNavigate()
  const productos = useProductStore((state) => state.products)

  const [solicitudes] = useState<Solicitud[]>([
    {
      id: "1",
      nombre: "Solicitud de Ejemplo",
      tiendas: 3,
      productos: [
        { nombre: "Producto A", cantidad: 1 },
        { nombre: "Producto B", cantidad: 2 }
      ],
      preguntas: ["¿Producto limpio?", "¿Fecha de expiración visible?"],
      estatus: "Pendiente"
    }
  ])

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Solicitudes</h1>
        <Button onClick={() => navigate("/crearSolicitud")}>
          Crear nueva solicitud
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cant. Tiendas</TableHead>
            <TableHead>Productos</TableHead>
            <TableHead>Preguntas</TableHead>
            <TableHead>Estatus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitudes.map((solicitud) => (
            <TableRow
              key={solicitud.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => navigate(`/detalle-solicitud/${solicitud.id}`)}
            >
              <TableCell>{solicitud.nombre}</TableCell>
              <TableCell>{solicitud.tiendas}</TableCell>
              <TableCell>
                {solicitud.productos
                  .map((p) => `${p.nombre} (${p.cantidad})`)
                  .join(", ")}
              </TableCell>
              <TableCell>{solicitud.preguntas.join(", ")}</TableCell>
              <TableCell>{solicitud.estatus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
