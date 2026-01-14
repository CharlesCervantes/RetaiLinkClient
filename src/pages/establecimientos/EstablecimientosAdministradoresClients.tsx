import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Plus, Loader2, Store, MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";

import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/datatble";
import { EstablecimientoModalRegistroMasivo } from './EstablecimientoModalRegistroMasivo';
import { ColumnDef } from '@tanstack/react-table';

import { getStoresForClient, deleteStoreClient } from "../../Fetch/establecimientos";
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '../../components/ui/dropdown-menu';

interface Establecimiento {
    id_store_client: number;
    id_store: number;
    id_client: number;
    id_user_creator: number;
    i_status: boolean;
    dt_register: string;
    dt_updated: string;
    name: string;
    store_code: string;
    street: string;
    ext_number: string;
    int_number: string;
    neighborhood: string;
    municipality: string;
    state: string;
    postal_code: string;
    country: string;
    latitude: number;
    longitude: number;
}

export function EstablecimientosAdministradoresClients() {
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true);
    const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
    const { user } = useAuthStore();

    // Cargar establecimientos al montar el componente
    useEffect(() => {
        fetchEstablecimientos();
    }, [user]);

    const handleDelete = (id_product: number) => {
        try {
            console.log("Hola")
        } catch (error) {
            console.error("f.handleDelete: ", error);
        }
    }

    const fetchEstablecimientos = async () => {
        if (!user?.id_client) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await getStoresForClient(user.id_client);
            
            if (response.ok) {
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

    const handleDeleteEstablecimeinto = async(id_store: number) => {
        try {
            if(user?.id_client && user.id_client > 0){
                const result = await deleteStoreClient(id_store);

                if(result.ok){
                    toast.success("Establecimiento eliminado correctamente");

                    window.location.reload();
                }
            } 
        } catch (error) {
            console.error("f.handleDeleteEstablecimeinto: ", error);
            toast.error("Erro al eliminar el establecimiento");
        }
    }

    const columns: ColumnDef<Establecimiento>[] = [
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "store_code",
            header: "Código de Tienda",
        },
        {
            accessorKey: "street",
            header: "Calle",
        },
        {
            accessorKey: "ext_number",
            header: "Número Exterior",
        },
        {
            accessorKey: "int_number",
            header: "Número Interior",
        },
        {
            accessorKey: "neighborhood",
            header: "Colonia",
        },
        {
            accessorKey: "municipality",
            header: "Municipio",
        },
        {
            accessorKey: "state",
            header: "Estado",
        },
        {
            accessorKey: "postal_code",
            header: "C.P.",
        },
        {
            accessorKey: "country",
            header: "País",
        },
        {
            id: "actions",
            header: "operaciones",
            cell: ({ row }) => {
                const store = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => navigate(`/establecimiento/detalle/${store.id_store_client}`)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate(`/establecimiento/${store.id_store_client}`)}
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteEstablecimeinto(store.id_store_client)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        <DataTable columns={columns} data={establecimientos} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Store size={32} className="text-gray-400" />
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