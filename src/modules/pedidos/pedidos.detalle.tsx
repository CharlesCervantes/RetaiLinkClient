import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Loader2, ArrowLeft, Store, User, MapPin, PlusCircle, X } from "lucide-react"


import { Button, Card } from '@/components'
import { getAllPromoters, Promotor } from "@/Fetch/promotores"
import { getOrderById, OrderData, assignPromoterTask, TaskData } from "@/Fetch/pedidos" 


export function PedidoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA EL MODAL DE ASIGNACIÓN ---
  const [modalOpen, setModalOpen] = useState(false);
  const [tareaActiva, setTareaActiva] = useState<TaskData | null>(null);
  const [promotores, setPromotores] = useState<Promotor[]>([]);
  const [selectedPromoter, setSelectedPromoter] = useState<number | "">("");
  const [asignando, setAsignando] = useState(false);

  // 1. Cargar el pedido inicial
  useEffect(() => {
    const fetchDatos = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getOrderById(Number(id));
        if (res.ok && res.data) {
          setPedido(res.data);
          
          // Pre-cargamos la lista de promotores para este cliente/negocio
          try {
            const resPromotores = await getAllPromoters();
            if (resPromotores.ok && resPromotores.data) {
              setPromotores(resPromotores.data);
            }
          } catch (e) {
            console.error("Error cargando promotores:", e);
          }
        }
      } catch (error) {
        console.error("Error cargando el pedido", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [id]);

  // 2. Abrir Modal
  const handleOpenAssignModal = (task: TaskData) => {
    setTareaActiva(task);
    setSelectedPromoter(task.id_promoter || "");
    setModalOpen(true);
  };

  // 3. Guardar Asignación
  const handleGuardarAsignacion = async () => {
    if (!tareaActiva) return;
    if (selectedPromoter === "") {
      alert("Por favor, selecciona un promotor.");
      return;
    }

    setAsignando(true);
    try {
      await assignPromoterTask(tareaActiva.id_task, Number(selectedPromoter));
      
      // Actualizamos el estado local para reflejar el cambio sin recargar
      const promotorAsignado = promotores.find(p => p.id_promoter === Number(selectedPromoter));
      
      setPedido(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks?.map(t => 
            t.id_task === tareaActiva.id_task 
              ? { ...t, id_promoter: Number(selectedPromoter), promoter_name: promotorAsignado?.vc_name || "Promotor asignado" } 
              : t
          )
        };
      });

      setModalOpen(false);
      alert("¡Promotor asignado con éxito!");
    } catch (error: any) {
      alert(error.message || "Hubo un error al asignar la tarea.");
    } finally {
      setAsignando(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto mb-4" />Cargando desglose del pedido...</div>;
  if (!pedido) return <div className="p-12 text-center">Pedido no encontrado.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 relative">
      
      {/* CABECERA DEL PEDIDO */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedido #{pedido.id_order}</h1>
          <p className="text-gray-500 mt-1">Configuración base: <span className="font-semibold text-blue-600">{pedido.request_name}</span></p>
        </div>
        <Button variant="outline" onClick={() => navigate("/pedidos")}>
          <ArrowLeft size={16} className="mr-2" /> Volver a Pedidos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RESUMEN FINANCIERO */}
        <Card className="p-5 md:col-span-1 bg-gray-900 text-white shadow-lg h-fit sticky top-6">
          <h2 className="text-lg font-bold text-gray-300 mb-4 border-b border-gray-700 pb-2">Resumen de Operación</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total de Tareas:</span>
              <span className="font-bold">{pedido.tasks?.length || 0} Tiendas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fecha creación:</span>
              <span className="font-medium">{new Date(pedido.dt_register).toLocaleDateString()}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-700 flex justify-between items-center">
              <span className="text-xl font-bold">Total Cobrado:</span>
              <span className="text-2xl font-black text-green-400">${Number(pedido.f_total).toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* LISTADO DE TAREAS */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Store size={24} className="text-blue-600"/> Tareas en Establecimientos
          </h2>
          
          <div className="grid gap-3">
            {pedido.tasks?.map((task) => (
              <Card key={task.id_task} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">ID: {task.id_task}</span>
                    <h3 className="font-bold text-gray-900 text-lg">{task.store_name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {task.street} {task.ext_number}, {task.neighborhood}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {/* ESTADO */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    task.id_status === 1 ? 'bg-amber-100 text-amber-800' :
                    task.id_status === 2 ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.id_status === 1 ? 'Pendiente' : task.id_status === 2 ? 'En Progreso' : 'Completada'}
                  </span>

                  {/* PROMOTOR ASIGNADO */}
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <User size={14} className={task.promoter_name ? "text-blue-600" : "text-gray-400"} />
                    {task.promoter_name ? (
                      <span className="font-medium text-blue-700">{task.promoter_name}</span>
                    ) : (
                      <span className="text-red-500 italic font-medium">Sin asignar</span>
                    )}
                  </div>
                </div>

                {/* BOTÓN ASIGNAR */}
                <Button 
                  variant={task.promoter_name ? "outline" : "default"} 
                  size="sm" 
                  className="w-full sm:w-auto mt-2 sm:mt-0"
                  onClick={() => handleOpenAssignModal(task)}
                >
                  {task.promoter_name ? "Cambiar Promotor" : "Asignar Promotor"}
                </Button>

              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL FLOTANTE DE ASIGNACIÓN --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Asignar Promotor</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Establecimiento:</p>
                <p className="font-semibold text-gray-900">{tareaActiva?.store_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona al encargado:</label>
                {promotores.length > 0 ? (
                  <select 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={selectedPromoter}
                    onChange={(e) => setSelectedPromoter(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="" disabled>-- Seleccione un promotor --</option>
                    {promotores.map(p => (
                      <option key={p.id_promoter} value={p.id_promoter}>{p.vc_name}</option>
                    ))}
                  </select>
                ) : (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                        No hay promotores registrados en el sistema. Por favor, da de alta un promotor en el panel de administración primero.
                    </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={asignando}>
                Cancelar
              </Button>
              <Button onClick={handleGuardarAsignacion} disabled={asignando || promotores.length === 0}>
                {asignando ? <Loader2 className="animate-spin mr-2" size={16}/> : <PlusCircle className="mr-2" size={16}/>}
                Confirmar Asignación
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}