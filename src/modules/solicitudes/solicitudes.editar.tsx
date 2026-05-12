import { useState, useEffect } from 'react'
import { Loader2, Save, ArrowLeft, Search, ImageOff, Check, PackageOpen } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'


import { Button, Badge, Checkbox } from '@/components'
import { useAuthStore } from '@/stores'
import { api, ApiResponse } from '@/lib'
import { getRequestById, updateFullRequest } from '@/Fetch/solicitudes'
import { ProductDTO, QuestionDTO } from '@/dtos'


interface ProductoSeleccionado extends ProductDTO {
  preguntas: {
    id_pregunta: number;
    vc_pregunta: string;
    dc_precio: number;
  }[];
}

export const EditarSolicitud = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // --- ESTADOS ---
  const [nombre, setNombre] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Catálogos
  const [listaProductos, setListaProductos] = useState<ProductDTO[]>([]);
  const [listaPreguntas, setListaPreguntas] = useState<QuestionDTO[]>([]);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorTexto, setErrorTexto] = useState<string | null>(null);

  // Estado principal
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);

  // Búsqueda de preguntas por producto
  const [busquedaPreguntas, setBusquedaPreguntas] = useState<Record<number, string>>({});

  // --- EFECTO: Cargar Solicitud y Catálogos ---
  useEffect(() => {
    const cargarTodo = async () => {
      if (!id) return;
      setCargandoInicial(true);
      setErrorTexto(null);

      try {
        // 1. Obtener los datos actuales de la solicitud
        const resSolicitud = await getRequestById(Number(id));
        if (!resSolicitud.ok || !resSolicitud.data) {
          throw new Error("No se pudo cargar la solicitud original.");
        }

        const dataSol = resSolicitud.data;
        setNombre(dataSol.vc_name);
        setSelectedClientId(dataSol.id_client || null);

        const currentClientId = dataSol.id_client;

        if (currentClientId) {
          // 2. Traer catálogos usando los mismos endpoints que en crear
          const [respProductos, respPreguntas] = await Promise.all([
            api.get<ApiResponse<ProductDTO[]>>(`/products/${currentClientId}`),
            api.get<ApiResponse<QuestionDTO[]>>(`/questions/list/${currentClientId}`)
          ]);

          setListaProductos(respProductos.data);
          setListaPreguntas(respPreguntas.data);

          // 3. Re-construir el estado de productosSeleccionados
          if (dataSol.productos) {
            const preSeleccionados: ProductoSeleccionado[] = dataSol.productos.map((p: any) => {
              const prodRef = respProductos.data.find(
                (pc: ProductDTO) => pc.id_product === p.id_product
              );

              return {
                ...(prodRef || ({} as ProductDTO)),
                id_product: p.id_product,
                name: prodRef ? prodRef.name : `Producto #${p.id_product}`,
                preguntas: p.preguntas?.map((q: any) => ({
                  id_pregunta: q.id_question,
                  vc_pregunta: q.vc_question || 'Pregunta',
                  dc_precio: 0
                })) || []
              };
            });

            setProductosSeleccionados(preSeleccionados);
          }
        }
      } catch (error: any) {
        console.error("Error al cargar datos para edición:", error);
        setErrorTexto(error.message || "Error al comunicarse con el servidor");
      } finally {
        setCargandoInicial(false);
      }
    };

    cargarTodo();
  }, [id]);

  // --- MANEJADORES DE EVENTOS ---
  const toggleProducto = (productoDB: ProductDTO) => {
    setProductosSeleccionados(prev => {
      const idProducto = productoDB.id_product;
      const existe = prev.find(p => p.id_product === idProducto);

      if (existe) {
        return prev.filter(p => p.id_product !== idProducto);
      } else {
        return [...prev, {
          ...productoDB,
          preguntas: []
        }];
      }
    });
  };

  const togglePregunta = (id_product: number, preguntaDB: any) => {
    setProductosSeleccionados(prev =>
      prev.map(prod => {
        if (prod.id_product === id_product) {
          const preguntaExiste = prod.preguntas.find(q => q.id_pregunta === preguntaDB.id_question);

          let nuevasPreguntas;
          if (preguntaExiste) {
            nuevasPreguntas = prod.preguntas.filter(q => q.id_pregunta !== preguntaDB.id_question);
          } else {
            nuevasPreguntas = [...prod.preguntas, {
              id_pregunta: preguntaDB.id_question,
              vc_pregunta: preguntaDB.question,
              dc_precio: 0
            }];
          }
          return { ...prod, preguntas: nuevasPreguntas };
        }
        return prod;
      })
    );
  };

  // --- CÁLCULOS DINÁMICOS (NUEVA LÓGICA DE PRECIOS) ---
  const totalPreguntas = productosSeleccionados.reduce((sum, prod) => sum + prod.preguntas.length, 0);

  const calcularCostoSolicitud = (numPreguntas: number) => {
    const base = 45;
    const preguntasExtra = Math.max(numPreguntas - 3, 0);
    const costoExtra = preguntasExtra * 15;
    return Math.min(base + costoExtra, 90);
  };

  const granTotal = calcularCostoSolicitud(totalPreguntas);
  const preguntasExtra = Math.max(totalPreguntas - 3, 0);
  const costoExtra = Math.min(preguntasExtra * 15, 45);

  // --- GUARDAR (ACTUALIZAR) ---
  const handleActualizar = async () => {
    if (!nombre.trim()) {
      alert("Por favor ingresa un nombre para la solicitud.");
      return;
    }
    if (productosSeleccionados.length === 0) {
      alert("Selecciona al menos un producto.");
      return;
    }
    if (!selectedClientId) {
      alert("Error: No se ha detectado el cliente de la solicitud.");
      return;
    }
    if (!user || !user.id_user) {
      alert("Error de sesión: No se encontró el ID de usuario.");
      return;
    }

    setGuardando(true);

    const payload = {
      id_user: user.id_user,
      id_cliente: selectedClientId,
      nombre_solicitud: nombre.trim(),
      costo_total: granTotal,
      productos: productosSeleccionados.map(prod => ({
        id_product: prod.id_product,
        subtotal: 0,
        preguntas: prod.preguntas.map(q => ({
          id_pregunta: q.id_pregunta,
          precio_aplicado: 0
        }))
      }))
    };

    try {
      const respuesta = await updateFullRequest(Number(id), payload);

      if (respuesta.ok) {
        alert("¡Solicitud actualizada con éxito!");
        navigate(`/detalle-solicitud/${id}`);
      }
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      alert(error.message || "Ocurrió un error al actualizar la solicitud.");
    } finally {
      setGuardando(false);
    }
  };

  // --- RENDERIZADO ---
  if (cargandoInicial) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium text-lg">Cargando datos de la solicitud...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Editar Solicitud #{id}</h2>
          <p className="text-sm text-gray-500 mt-1">Modifica los productos o checklist y guarda los cambios.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/detalle-solicitud/${id}`)} className="flex items-center gap-2">
          <ArrowLeft size={16} /> Cancelar
        </Button>
      </div>

      {errorTexto && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {errorTexto}
        </div>
      )}

      {/* 1. Nombre de la solicitud */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Nombre de la Solicitud</label>
        <input
          type="text"
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej. Auditoría de Verano"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>

      {/* 2. Selección de Productos */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-gray-700 font-semibold">1. Modifica los Productos a auditar</label>
          <Badge variant="secondary">{productosSeleccionados.length} seleccionados</Badge>
        </div>
        {listaProductos.length === 0 ? (
          <p className="text-gray-500 italic p-4 bg-gray-50 rounded">No hay productos registrados en el catálogo.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {listaProductos.map(prod => {
              const idProducto = prod.id_product;
              const seleccionado = productosSeleccionados.some(p => p.id_product === idProducto);
              const prodSel = productosSeleccionados.find(p => p.id_product === idProducto);
              const cantPreguntas = prodSel?.preguntas.length || 0;

              return (
                <div
                  key={idProducto}
                  onClick={() => toggleProducto(prod)}
                  className={`relative group cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
                    seleccionado
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  {seleccionado && (
                    <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white rounded-full p-1 shadow">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    {prod.vc_image ? (
                      <img
                        src={prod.vc_image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <ImageOff size={32} />
                        <span className="text-xs mt-1">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="font-medium text-sm text-gray-800 line-clamp-2 text-center" title={prod.name}>
                      {prod.name}
                    </p>
                    {seleccionado && cantPreguntas > 0 && (
                      <p className="text-xs text-blue-600 text-center mt-1 font-medium">
                        {cantPreguntas} pregunta{cantPreguntas !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Configuración de Preguntas */}
      {productosSeleccionados.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-gray-700 font-semibold">2. Ajusta las Preguntas por Producto</label>
            <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
              {totalPreguntas} pregunta{totalPreguntas !== 1 ? 's' : ''} en total
            </Badge>
          </div>

          {productosSeleccionados.map(producto => {
            const busqueda = busquedaPreguntas[producto.id_product] || '';
            const preguntasFiltradas = listaPreguntas.filter(p =>
              p.question?.toLowerCase().includes(busqueda.toLowerCase())
            );
            const cantidadSel = producto.preguntas.length;

            return (
              <div key={producto.id_product} className="mb-5 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                      <PackageOpen size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{producto.name}</h3>
                      <p className="text-xs text-gray-500">{cantidadSel} pregunta{cantidadSel !== 1 ? 's' : ''} seleccionada{cantidadSel !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar preguntas..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={busqueda}
                      onChange={(e) => setBusquedaPreguntas(prev => ({ ...prev, [producto.id_product]: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                    {listaPreguntas.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No hay preguntas disponibles en el catálogo.</p>
                    ) : preguntasFiltradas.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No se encontraron preguntas con "{busqueda}"</p>
                    ) : (
                      preguntasFiltradas.map(pregunta => {
                        const seleccionada = producto.preguntas.some(q => q.id_pregunta === pregunta.id_question);
                        return (
                          <div
                            key={pregunta.id_question}
                            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors border ${
                              seleccionada
                                ? 'bg-green-50 border-green-200'
                                : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                            }`}
                          >
                            <div className="shrink-0">
                              <Checkbox
                                checked={seleccionada}
                                onCheckedChange={() => togglePregunta(producto.id_product, pregunta)}
                                className="border-gray-300 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                            </div>
                            <span className={`text-sm font-medium flex-1 select-none ${seleccionada ? 'text-green-800' : 'text-gray-700'}`}>
                              {pregunta.question}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Resumen y Guardar */}
      {productosSeleccionados.length > 0 && (
        <>
          <hr className="my-6 border-gray-300" />
          <div className="bg-gray-900 text-white p-5 rounded-xl shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-8">
                  <span className="text-gray-300">Costo base (hasta 3 preguntas):</span>
                  <span className="font-medium">$45.00</span>
                </div>
                {preguntasExtra > 0 && (
                  <div className="flex justify-between gap-8 text-amber-300">
                    <span>Preguntas extra ({preguntasExtra}):</span>
                    <span>+ ${costoExtra.toFixed(2)}</span>
                  </div>
                )}
                {granTotal >= 90 && totalPreguntas > 6 && (
                  <div className="text-xs text-gray-400 italic">
                    Precio máximo alcanzado. Puedes seguir agregando preguntas sin costo adicional.
                  </div>
                )}
                <div className="flex justify-between gap-8 text-lg pt-2 border-t border-gray-700">
                  <span className="font-bold">Costo Total:</span>
                  <span className="font-bold text-green-400">${granTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleActualizar}
                disabled={guardando}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-6 px-8 rounded-lg shadow transition-colors text-lg flex items-center gap-2 w-full lg:w-auto"
              >
                {guardando ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {guardando ? 'Guardando...' : 'Actualizar Solicitud'}
              </Button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
