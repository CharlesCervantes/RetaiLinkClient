import { useSolicitudStore } from "../store/solicitudes";
import { useProductStore } from "../store/productStore";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Pregunta {
  id: string
  texto: string
  precio: number
}

const mockPreguntas: Pregunta[] = [
  { id: "1", texto: "¿Producto limpio?", precio: 0 },
  { id: "2", texto: "¿Fecha de expiración visible?", precio: 10 },
  { id: "3", texto: "¿Etiqueta visible?", precio: 5 }
]

export default function CrearSolicitud() {
  const navigate = useNavigate()
  const catalogo = useProductStore((state) => state.products)
  const {
    agregarProducto,
    eliminarProducto,
    calcularPrecioTotal,
    productos,
    limpiarSolicitud
  } = useSolicitudStore()

  const [paso, setPaso] = useState(0)
  const [productoActual, setProductoActual] = useState<typeof catalogo[0] | null>(null)
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState<Pregunta[]>([])

  const productosDisponibles = catalogo.filter(
    (p) => !productos.some((prod) => prod.id === p.id)
  )

  const handleSeleccionarProducto = (producto: typeof catalogo[0]) => {
    setProductoActual(producto)
    setPreguntasSeleccionadas([])
  }

  const handleTogglePregunta = (pregunta: Pregunta) => {
    const yaSeleccionada = preguntasSeleccionadas.find((p) => p.id === pregunta.id)
    if (yaSeleccionada) {
      setPreguntasSeleccionadas(preguntasSeleccionadas.filter((p) => p.id !== pregunta.id))
    } else {
      const gratisYaTomada = preguntasSeleccionadas.some((p) => p.precio === 0)
      if (pregunta.precio === 0 && gratisYaTomada) {
        toast({ title: "Solo puedes seleccionar una pregunta gratuita" })
        return
      }
      setPreguntasSeleccionadas([...preguntasSeleccionadas, pregunta])
    }
  }

  const handleConfirmarProducto = () => {
    if (!productoActual) return
    if (preguntasSeleccionadas.length === 0) {
      toast({ title: "Debes seleccionar al menos una pregunta" })
      return
    }

    agregarProducto({
      id: productoActual.id,
      nombre: productoActual.name,
      imagenes: productoActual.images.map((img) =>
        typeof img === "string" ? img : URL.createObjectURL(img)
      ),
      preguntas: preguntasSeleccionadas
    })

    setProductoActual(null)
    setPreguntasSeleccionadas([])
    setPaso(paso + 1)
  }

  const handleGuardarSolicitud = () => {
    limpiarSolicitud()
    navigate("/solicitudes")
  }

  return (
    <div className="p-4 flex gap-6">
      {/* Columna izquierda */}
      <div className="w-2/3">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Paso 1: Agrega tus productos</h1>
        </div>

        {productos.length >= 3 && (
          <p className="text-sm text-amber-600 mb-2">
            Al agregar un producto extra se suman $15 MXN adicionales.
          </p>
        )}

        {/* Lista de productos disponibles */}
        {!productoActual ? (
          <div
            className={`flex flex-col ${
              productosDisponibles.length === 1 ? "items-center" : "items-start"
            } space-y-4`}
          >
            {productosDisponibles.length > 0 ? (
              productosDisponibles.map((producto) => (
                <Card
                  key={producto.id}
                  onClick={() => handleSeleccionarProducto(producto)}
                  className="cursor-pointer hover:ring-2 ring-primary w-full max-w-xs flex items-center p-2"
                >
                  <img
                    src={
                      producto.images.length > 0
                        ? URL.createObjectURL(producto.images[0])
                        : ""
                    }
                    alt={producto.name}
                    className="w-20 h-20 object-cover rounded border mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{producto.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {producto.description || "Sin descripción"}
                    </p>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">Todos los productos ya fueron agregados.</p>
            )}
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-lg mb-2">Selecciona preguntas para: {productoActual.name}</h2>
            <div className="space-y-2 mb-4">
              {mockPreguntas.map((p) => {
                const selected = preguntasSeleccionadas.some((ps) => ps.id === p.id)
                return (
                  <div
                    key={p.id}
                    className={`border p-2 rounded cursor-pointer ${
                      selected ? "bg-primary text-white" : "hover:bg-muted"
                    }`}
                    onClick={() => handleTogglePregunta(p)}
                  >
                    {p.texto} {p.precio > 0 && `(+${p.precio} MXN)`}
                  </div>
                )
              })}
            </div>
            <Button onClick={handleConfirmarProducto} disabled={preguntasSeleccionadas.length === 0}>
              Confirmar producto
            </Button>
          </>
        )}
      </div>

      {/* Columna derecha */}
      <div className="w-1/3 flex flex-col justify-between h-[calc(100vh-2rem)]">
        <div>
          <h2 className="text-lg font-semibold mb-2">Productos y preguntas seleccionadas</h2>
          <Separator className="mb-4" />
          {productoActual ? (
            <div className="border rounded-lg p-3 shadow-md bg-white">
              <h3 className="font-semibold mb-2">{productoActual.name}</h3>
              {productoActual.images.length > 0 ? (
                <img
                  src={URL.createObjectURL(productoActual.images[0])}
                  alt={productoActual.name}
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Sin imagen</p>
              )}
              <ul className="mt-3 text-sm text-muted-foreground list-disc list-inside">
                {preguntasSeleccionadas.map((p) => (
                  <li key={p.id}>{p.texto}</li>
                ))}
              </ul>
            </div>
          ) : productos.length > 0 ? (
            <div
              className={`flex flex-col ${
                productos.length === 1 ? "items-center" : "items-start"
              } space-y-4`}
            >
              {productos.map((p, index) => {
                const totalPreguntas = p.preguntas.reduce((acc, q) => acc + q.precio, 0)
                const costoExtraProducto = index >= 3 ? 15 : 0
                const totalExtra = totalPreguntas + costoExtraProducto

                return (
                  <div
                    key={p.id}
                    className="flex items-center border rounded-lg p-3 shadow-md bg-white relative group w-full max-w-xs"
                  >
                    <img
                      src={p.imagenes[0]}
                      alt={p.nombre}
                      className="w-20 h-20 object-cover rounded mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{p.nombre}</h3>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {p.preguntas.map((q) => (
                          <li key={q.id}>{q.texto}</li>
                        ))}
                      </ul>
                      {totalExtra > 0 && (
                        <span className="text-sm text-green-600 font-semibold">
                          + ${totalExtra} MXN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarProducto(p.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-destructive text-white p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Aún no has agregado productos.</p>
          )}
        </div>

        {/* pie fijo */}
        <div className="mt-4">
          <Separator className="mb-2" />
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold">${calcularPrecioTotal()} MXN</span>
          </div>
          <Button
            onClick={handleGuardarSolicitud}
            disabled={!!productoActual}
            className="w-full"
          >
            Guardar solicitud
          </Button>
        </div>
      </div>
    </div>
  )
}
