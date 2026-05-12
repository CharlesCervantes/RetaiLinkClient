import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Link, useNavigate } from "react-router-dom"
import { Plus, Loader2, Store as StoreIcon, Eye, Trash2 } from "lucide-react"


import { StoreDTO } from '@/dtos'
import { api, ApiResponse } from '@/lib'
import { deleteStore } from '@/Fetch/establecimientos'
import { EstablecimientoModalRegistroMasivo } from './EstablecimientoModalRegistroMasivo'
import { Button, DataTable, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components'


export function EstablecimientosSuperAdmin() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true);
    const [establecimientos, setEstablecimientos] = useState<StoreDTO[]>([]);

    useEffect(() => {
        fetchEstablecimientos();
    }, []);


    const fetchEstablecimientos = async () => {
        try {
            setLoading(true);
            const response = await api.get<ApiResponse<StoreDTO[]>>(`/stores`)
            if (response.ok && response.data) {
                setEstablecimientos(response.data);
            } else {
                toast.error("Error al cargar establecimientos");
            }
        } catch (error) {
            console.error("Error fetching establecimientos:", error);
            toast.error("Error al cargar establecimientos");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEstablecimiento = async (id_store: number) => {
        try {
            const result = await deleteStore(id_store);

            if (result.ok) {
                toast.success("Establecimiento eliminado correctamente");
                fetchEstablecimientos();
            } else {
                toast.error("Error al eliminar el establecimiento");
            }
        } catch (error) {
            console.error("f.handleDeleteEstablecimiento: ", error);
            toast.error("Error al eliminar el establecimiento");
        }
    }

    const columns: ColumnDef<StoreDTO>[] = [
        {
            id: "sales_channel",
            header: "Canal de venta",
            meta: { className: "text-center" }, 
            cell: ({ row }) => {
                const store = row.original;

                if(store.sales_channel){
                    return (
                        <div className="flex flex-col items-center justify-center gap-2 py-2">
                            <img 
                                src={store.sales_channel.url_image} 
                                alt={store.sales_channel.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200 bg-white" 
                            />
                            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                                {store.sales_channel.name}
                            </span>
                        </div>
                    )
                }
                return <span className="text-xs text-gray-400">Sin canal</span>
            }
        },
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "store_code",
            header: "Código de Tienda",
        },
        {
            accessorKey: "address.city.name",
            header: "Municipio",
        },
        {
            accessorKey: "address.state.name",
            header: "Estado",
        },
        {
            id: "actions",
            header: "Operaciones",
            meta: { className: "text-center" },
            cell: ({ row }) => {
                const store = row.original;

                return (
                    <TooltipProvider delayDuration={100}>
                        <div className="flex items-center justify-center gap-2">
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => navigate(`/establecimiento/detalle/${store.id_store}`)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Ver detalle</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleDeleteEstablecimiento(store.id_store)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Eliminar</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                )
            }
        }
    ];

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Establecimientos</h1>
                    <p className="text-sm text-gray-500 mt-1">Administra los establecimientos</p>
                </div>

                <div className="flex gap-4">
                    <Link to="/establecimiento">
                        <Button className="flex items-center gap-2">
                            <Plus size={18} />
                            Nuevo Establecimiento
                        </Button>
                    </Link>

                    <EstablecimientoModalRegistroMasivo 
                        onSuccess={() => fetchEstablecimientos()}
                    />
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            )}

            {!loading && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    {establecimientos.length > 0 ? (
                        <DataTable 
                            columns={columns} 
                            data={establecimientos}
                            pagination={{
                                mode: "client",
                                pageSize: 10,
                                pageSizeOptions: [5, 10, 20, 50],
                                showPageSizeSelector: true,
                                showSelectedCount: true,
                                showPageNavigation: true,
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <StoreIcon size={32} className="text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-1">
                                Sin establecimientos
                            </h4>
                            <p className="text-gray-500 mb-4">
                                Aún no hay establecimientos registrados para este cliente.
                            </p>
                            <Link to="/establecimiento">
                                <Button>
                                    <Plus size={16} className="mr-2" />
                                    Agregar primer establecimiento
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}