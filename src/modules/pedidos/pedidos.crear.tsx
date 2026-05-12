import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Store, ClipboardList, Check, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

import { useAuthStore } from '@/stores'
import { api, ApiResponse } from '@/lib'
import { getCLientsList } from '@/Fetch/clientes'
import {
  PageWrapper,
  PageHeader,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components'
import { StoreDTO, RequestDTO, ClientListDTO } from '@/dtos'

interface RequestSeleccionada extends RequestDTO {
  storesSeleccionadas: number[]
}

export const CrearPedido = () => {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.id_client === 0 || user?.i_rol === 1

  // --- Clientes (solo super admin) ---
  const [clientes, setClientes] = useState<ClientListDTO[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [loadingClientes, setLoadingClientes] = useState(false)

  // --- Datos del cliente ---
  const [requests, setRequests] = useState<RequestDTO[]>([])
  const [stores, setStores] = useState<StoreDTO[]>([])
  const [loadingDatos, setLoadingDatos] = useState(false)

  // --- Items del pedido ---
  const [items, setItems] = useState<RequestSeleccionada[]>([])

  // --- UI ---
  const [requestAbierta, setRequestAbierta] = useState<number | null>(null)
  const [guardando, setGuardando] = useState(false)

  // --- Cargar clientes (super admin) ---
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchClients = async () => {
        setLoadingClientes(true)
        try {
          const response = await getCLientsList()
          const list = response.data || []
          setClientes(list)
          if (list.length > 0) {
            setSelectedClientId(list[0].id_client)
          }
        } catch (error) {
          console.error('Error al cargar clientes:', error)
          toast.error('Error al cargar la lista de clientes.')
        } finally {
          setLoadingClientes(false)
        }
      }
      fetchClients()
    } else {
      setSelectedClientId(user?.id_client || null)
    }
  }, [isSuperAdmin, user])

  // --- Cargar requests y stores del cliente seleccionado ---
  useEffect(() => {
    if (!selectedClientId) return

    const fetchData = async () => {
      setLoadingDatos(true)
      setItems([])
      setRequestAbierta(null)
      try {
        const [resRequests, resStores] = await Promise.all([
          api.get<ApiResponse<{ data: RequestDTO[] }>>(`/requests?id_client=${selectedClientId}`),
          api.get<ApiResponse<StoreDTO[]>>(`/stores/`),
        ])

        if (resRequests.ok && resRequests.data?.data) {
          console.log('[Pedidos] Requests cargadas:', resRequests.data.data)
          setRequests(resRequests.data.data)
        } else {
          console.warn('[Pedidos] No se encontraron requests en la respuesta:', resRequests)
          setRequests([])
        }

        if (resStores.ok && resStores.data) {
          console.log('[Pedidos] Stores cargadas:', resStores.data)
          setStores(resStores.data)
        } else {
          console.warn('[Pedidos] No se encontraron stores en la respuesta:', resStores)
          setStores([])
        }
      } catch (error) {
        console.error('Error cargando datos del cliente:', error)
        toast.error('Error al cargar solicitudes y tiendas.')
        setRequests([])
        setStores([])
      } finally {
        setLoadingDatos(false)
      }
    }

    fetchData()
  }, [selectedClientId])

  // --- Handlers ---
  const handleClientChange = (value: string) => {
    setSelectedClientId(Number(value))
  }

  const agregarRequest = (request: RequestDTO) => {
    if (items.some((i) => i.id_request === request.id_request)) return
    setItems((prev) => [...prev, { ...request, storesSeleccionadas: [] }])
    setRequestAbierta(request.id_request)
  }

  const removerRequest = (id_request: number) => {
    setItems((prev) => prev.filter((i) => i.id_request !== id_request))
    if (requestAbierta === id_request) setRequestAbierta(null)
  }

  const toggleStore = (id_request: number, id_store: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id_request !== id_request) return item
        const existe = item.storesSeleccionadas.includes(id_store)
        return {
          ...item,
          storesSeleccionadas: existe
            ? item.storesSeleccionadas.filter((s) => s !== id_store)
            : [...item.storesSeleccionadas, id_store],
        }
      }),
    )
  }

  const seleccionarTodasTiendas = (id_request: number) => {
    const ids = stores.map((s) => s.id_store)
    setItems((prev) =>
      prev.map((item) =>
        item.id_request === id_request ? { ...item, storesSeleccionadas: ids } : item,
      ),
    )
  }

  const limpiarTiendas = (id_request: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id_request === id_request ? { ...item, storesSeleccionadas: [] } : item,
      ),
    )
  }

  // --- Cálculos ---
  const calcularCostoItem = (item: RequestSeleccionada) => {
    const count = item.storesSeleccionadas.length
    if (count === 0) return 0
    return Number(item.f_value) * count
  }

  const granTotal = items.reduce((sum, item) => sum + calcularCostoItem(item), 0)
  const totalTiendas = items.reduce((sum, item) => sum + item.storesSeleccionadas.length, 0)

  // --- Guardar ---
  const handleGuardar = async () => {
    if (!selectedClientId) {
      toast.error('Selecciona un cliente.')
      return
    }
    if (items.length === 0) {
      toast.error('Agrega al menos una solicitud al pedido.')
      return
    }
    const itemsSinTiendas = items.filter((i) => i.storesSeleccionadas.length === 0)
    if (itemsSinTiendas.length > 0) {
      // Abrimos la primera request sin tiendas para que el usuario la corrija
      setRequestAbierta(itemsSinTiendas[0].id_request)
      toast.error(
        `Hay ${itemsSinTiendas.length} solicitud(es) sin tiendas. Selecciona al menos una tienda para cada solicitud, o quítala del pedido.`,
        { duration: 5000 }
      )
      return
    }
    if (!user || !user.id_user) {
      toast.error('Error de sesión.')
      return
    }

    setGuardando(true)
    try {
      const payload = {
        id_user: user.id_user,
        id_client: selectedClientId,
        items: items
          .filter((item) => item.storesSeleccionadas.length > 0)
          .map((item) => ({
            id_request: item.id_request,
            stores: item.storesSeleccionadas,
          })),
      }

      const resp = await api.post<ApiResponse<any>>('/orders', payload);
      console.log("respuesta: ", resp);

      console.log('BODY A ENVIAR:', JSON.stringify(payload, null, 2))
      toast.success('Body impreso en consola. Revisa el navegador.')
    } catch (error: any) {
      console.error('Error al guardar:', error)
      toast.error(error.message || 'Error al guardar el pedido.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Crear Pedido"
        subtitle="Asigna tiendas a solicitudes para generar una orden de servicio"
        icon={ClipboardList}
      />

      {/* Selector de Cliente */}
      {isSuperAdmin && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente:</label>
          {loadingClientes ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={16} />
              Cargando clientes...
            </div>
          ) : (
            <Select value={selectedClientId?.toString() || ''} onValueChange={handleClientChange}>
              <SelectTrigger className="w-full md:w-1/2 bg-white">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id_client} value={c.id_client.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {!selectedClientId ? (
        <div className="text-center py-12 text-gray-500">
          {isSuperAdmin ? 'Selecciona un cliente para continuar.' : 'Cargando información del cliente...'}
        </div>
      ) : loadingDatos ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Cargando solicitudes y tiendas...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* --- SECCIÓN 1: Solicitudes disponibles --- */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">1. Solicitudes disponibles</h3>
            {requests.length === 0 ? (
              <p className="text-gray-500 italic p-4 bg-gray-50 rounded">No hay solicitudes activas para este cliente.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {requests.map((req) => {
                  const yaAgregada = items.some((i) => i.id_request === req.id_request)
                  return (
                    <div
                      key={req.id_request}
                      className={`relative border-2 rounded-xl p-4 transition-all ${
                        yaAgregada
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
                      }`}
                      onClick={() => !yaAgregada && agregarRequest(req)}
                    >
                      {yaAgregada && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <p className="font-semibold text-gray-800">{req.vc_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Valor: <span className="font-medium text-gray-700">${Number(req.f_value).toFixed(2)} MXN</span>
                      </p>
                      {!yaAgregada && (
                        <div className="mt-3 flex items-center gap-1 text-blue-600 text-sm font-medium">
                          <Plus size={16} /> Agregar al pedido
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* --- SECCIÓN 2: Items del pedido --- */}
          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">2. Configura tiendas por solicitud</h3>
              <div className="space-y-4">
                {items.map((item) => {
                  const abierta = requestAbierta === item.id_request
                  const costo = calcularCostoItem(item)
                  const count = item.storesSeleccionadas.length

                  return (
                    <Card key={item.id_request} className="overflow-hidden border-gray-200">
                      <CardHeader className="p-0">
                        <button
                          type="button"
                          onClick={() => setRequestAbierta(abierta ? null : item.id_request)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-700 rounded-lg p-2">
                              <ClipboardList size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{item.vc_name}</p>
                              <p className="text-xs text-gray-500">
                                {count} tienda{count !== 1 ? 's' : ''} seleccionada
                                {count !== 1 ? 's' : ''} · Subtotal:{' '}
                                <span className="font-semibold text-gray-700">${costo.toFixed(2)}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">${Number(item.f_value).toFixed(2)} c/u</Badge>
                            {abierta ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                          </div>
                        </button>
                      </CardHeader>

                      {abierta && (
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Store size={16} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Tiendas:</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => seleccionarTodasTiendas(item.id_request)}>
                                Todas
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => limpiarTiendas(item.id_request)}>
                                Limpiar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removerRequest(item.id_request)}>
                                <Trash2 size={16} className="mr-1" /> Quitar
                              </Button>
                            </div>
                          </div>

                          {stores.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">No hay tiendas registradas para este cliente.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {stores.map((store) => {
                                const seleccionada = item.storesSeleccionadas.includes(store.id_store)
                                return (
                                  <div
                                    key={store.id_store}
                                    onClick={() => toggleStore(item.id_request, store.id_store)}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                      seleccionada
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <Checkbox checked={seleccionada} className="pointer-events-none" />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${seleccionada ? 'text-blue-800' : 'text-gray-700'}`}>
                                        {store.name}
                                      </p>
                                      <p className="text-xs text-gray-400 truncate">
                                        {store.address?.street || ''} {store.address?.ext_number || ''}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* --- SECCIÓN 3: Resumen y Guardar --- */}
          {items.length > 0 && (
            <div className="bg-gray-900 text-white p-5 rounded-xl shadow-lg">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-300">Solicitudes:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-gray-300">Tiendas totales:</span>
                    <span className="font-medium">{totalTiendas}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-lg pt-2 border-t border-gray-700">
                    <span className="font-bold">Costo Total:</span>
                    <span className="font-bold text-green-400">${granTotal.toFixed(2)} MXN</span>
                  </div>
                </div>

                <Button
                  onClick={handleGuardar}
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors text-lg w-full lg:w-auto"
                >
                  {guardando ? 'Guardando...' : 'Crear Pedido'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  )
}
