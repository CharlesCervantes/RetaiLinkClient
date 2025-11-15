import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useSolicitudStore } from "../store/solicitudes";
import { useProductStore } from "../store/productStore";

import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Separator } from "../components/ui/separator";

import { Trash2 } from "lucide-react";

// -------------------- Tipos --------------------
interface Pregunta {
  id: number;
  texto: string;
  precio: number; // 0 = gratuita
}

// Preguntas mock mientras no hay backend
const mockPreguntas: Pregunta[] = [
  { id: 1, texto: "¿Producto limpio?", precio: 0 },
  { id: 2, texto: "¿Fecha de expiración visible?", precio: 10 },
  { id: 3, texto: "¿Etiqueta visible?", precio: 5 },
];

// Util: genera URL segura para File | string
const toImgUrl = (img: File | string) =>
  typeof img === "string" ? img : URL.createObjectURL(img);

// -------------------- Subcomponentes --------------------
function ProductoCard({
  producto,
  onSelect,
}: {
  producto: { id_producto: string; name: string; description?: string; images: (File | string)[] };
  onSelect: () => void;
}) {
  const imgUrl = useMemo(() => (producto.images?.[0] ? toImgUrl(producto.images[0]) : ""), [producto.images]);

  // Revoca el objectURL si aplica
  useEffect(() => {
    return () => {
      if (producto.images?.[0] && typeof producto.images[0] !== "string") {
        URL.revokeObjectURL(imgUrl);
      }
    };
  }, [imgUrl, producto.images]);

  return (
    <Card
      onClick={onSelect}
      className="cursor-pointer hover:ring-2 ring-primary w-full max-w-xs flex items-center p-2 gap-3"
    >
      {imgUrl ? (
        <img src={imgUrl} alt={producto.name} className="w-20 h-20 object-cover rounded border" />
      ) : (
        <div className="w-20 h-20 grid place-content-center border rounded text-xs text-muted-foreground">Sin imagen</div>
      )}

      <div className="flex-1">
        <h3 className="font-semibold text-base line-clamp-1">{producto.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{producto.description || "Sin descripción"}</p>
      </div>
    </Card>
  );
}

function PreguntaItem({ pregunta, selected, onToggle }: { pregunta: Pregunta; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left border p-2 rounded transition-colors ${
        selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{pregunta.texto}</span>
        {pregunta.precio > 0 && <span className="text-xs opacity-80">+${pregunta.precio} MXN</span>}
      </div>
    </button>
  );
}

function ProductoSeleccionado({
  p,
  onRemove,
  index,
}: {
  p: { id: string; nombre: string; imagenes: string[]; preguntas: Pregunta[] };
  onRemove: () => void;
  index: number;
}) {
  const costoPreguntas = p.preguntas.reduce((acc, q) => acc + q.precio, 0);
  const costoExtraProducto = index >= 3 ? 15 : 0; // 4to en adelante
  const totalExtra = costoPreguntas + costoExtraProducto;

  return (
    <div className="flex items-center border rounded-lg p-3 shadow-sm bg-background relative group w-full max-w-xs">
      {p.imagenes?.[0] ? (
        <img src={p.imagenes[0]} alt={p.nombre} className="w-20 h-20 object-cover rounded mr-4" />
      ) : (
        <div className="w-20 h-20 mr-4 grid place-content-center border rounded text-xs text-muted-foreground">Sin imagen</div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-1 truncate">{p.nombre}</h3>
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
          {p.preguntas.map((q) => (
            <li key={q.id} className="truncate">{q.texto}</li>
          ))}
        </ul>
        {totalExtra > 0 && <span className="text-sm text-green-600 font-semibold">+ ${totalExtra} MXN</span>}
      </div>

      <button
        onClick={onRemove}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground p-1 rounded"
        aria-label="Eliminar producto"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// -------------------- Página --------------------
export default function CrearSolicitud() {
  const navigate = useNavigate();

  const { products } = useProductStore();

  const { agregarProducto, eliminarProducto, calcularPrecioTotal, productos, limpiarSolicitud } = useSolicitudStore();

  const [productoActual, setProductoActual] = useState<(typeof products)[number] | null>(null);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState<Pregunta[]>([]);

  // Filtra productos que aún no han sido agregados a la solicitud
  const productosDisponibles = useMemo(
    () => products.filter((p) => !productos.some((sel) => sel.id === p.id_producto)),
    [products, productos]
  );

  // Selección de producto del catálogo
  const handleSeleccionarProducto = (producto: (typeof products)[number]) => {
    setProductoActual(producto);
    setPreguntasSeleccionadas([]);
  };

  // Toggle de preguntas con 1 gratis por producto
  const handleTogglePregunta = (pregunta: Pregunta) => {
    const exists = preguntasSeleccionadas.some((p) => p.id === pregunta.id);
    if (exists) {
      setPreguntasSeleccionadas((prev) => prev.filter((p) => p.id !== pregunta.id));
      return;
    }

    const yaHayGratis = preguntasSeleccionadas.some((p) => p.precio === 0);
    if (pregunta.precio === 0 && yaHayGratis) {
      toast("Solo puedes seleccionar una pregunta gratuita por producto");
      return;
    }

    setPreguntasSeleccionadas((prev) => [...prev, pregunta]);
  };

  // Confirma producto + preguntas
  const handleConfirmarProducto = () => {
    if (!productoActual) return;
    if (preguntasSeleccionadas.length === 0) {
      toast("Debes seleccionar al menos una pregunta");
      return;
    }

    agregarProducto({
      id: productoActual.id_producto,
      nombre: productoActual.name,
      imagenes: (productoActual.images || []).map((img) => toImgUrl(img)),
      preguntas: preguntasSeleccionadas,
    });

    setProductoActual(null);
    setPreguntasSeleccionadas([]);
  };

  // Guarda solicitud (mock): limpia el store y vuelve a listado
  const handleGuardarSolicitud = () => {
    if (productoActual) {
      toast("Termina de confirmar el producto en edición antes de guardar");
      return;
    }

    if (productos.length === 0) {
      toast("Agrega al menos un producto a la solicitud");
      return;
    }

    // Aquí iría la llamada al backend para persistir la solicitud
    limpiarSolicitud();
    navigate("/solicitudes");
  };

  // -------------------- Render --------------------
  return (
    <div className="p-4 flex gap-6">
      {/* Columna izquierda: catálogo / selección de preguntas */}
      <div className="w-full lg:w-2/3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Paso 1: Agrega tus productos</h1>
        </div>

        {productos.length >= 3 && (
          <p className="text-sm text-amber-600 mb-2">Al agregar un producto extra se suman $15 MXN adicionales.</p>
        )}

        {/* Lista de productos disponibles o selector de preguntas */}
        {!productoActual ? (
          <div className={`flex flex-col ${productosDisponibles.length === 1 ? "items-center" : "items-start"} gap-4`}>
            {productosDisponibles.length > 0 ? (
              productosDisponibles.map((producto) => (
                <ProductoCard key={producto.id_producto} producto={producto} onSelect={() => handleSeleccionarProducto(producto)} />
              ))
            ) : (
              <p className="text-muted-foreground">Todos los productos del catálogo ya fueron agregados.</p>
            )}
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-lg mb-2">Selecciona preguntas para: {productoActual.name}</h2>
            <div className="space-y-2 mb-4">
              {mockPreguntas.map((p) => (
                <PreguntaItem
                  key={p.id}
                  pregunta={p}
                  selected={preguntasSeleccionadas.some((ps) => ps.id === p.id)}
                  onToggle={() => handleTogglePregunta(p)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setProductoActual(null)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmarProducto} disabled={preguntasSeleccionadas.length === 0}>
                Confirmar producto
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Columna derecha: resumen */}
      <div className="w-full lg:w-1/3 flex flex-col justify-between lg:h-[calc(100vh-2rem)]">
        <div>
          <h2 className="text-lg font-semibold mb-2">Productos y preguntas seleccionadas</h2>
          <Separator className="mb-4" />

          {productoActual ? (
            <div className="border rounded-lg p-3 shadow-sm bg-background">
              <h3 className="font-semibold mb-2">{productoActual.name}</h3>
              {productoActual.images?.[0] ? (
                <img src={toImgUrl(productoActual.images[0])} alt={productoActual.name} className="w-16 h-16 object-cover rounded border" />
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
            <div className={`flex flex-col ${productos.length === 1 ? "items-center" : "items-start"} gap-4`}>
              {productos.map((p, index) => (
                <ProductoSeleccionado key={p.id} p={p} index={index} onRemove={() => eliminarProducto(p.id)} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aún no has agregado productos.</p>
          )}
        </div>

        {/* Footer fijo */}
        <div className="mt-4">
          <Separator className="mb-2" />
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Total:</span>
            <span className="text-lg font-bold">${calcularPrecioTotal()} MXN</span>
          </div>
          <Button onClick={handleGuardarSolicitud} className="w-full">
            Guardar solicitud
          </Button>
        </div>
      </div>
    </div>
  );
}
