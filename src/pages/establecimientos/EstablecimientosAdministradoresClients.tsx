import { useState } from 'react';
import { Link } from "react-router-dom";
import { Plus, Loader2, Store } from "lucide-react";

import { Button } from "../../components/ui/button";
import { DataTable } from "../../components/ui/datatble";
import { EstablecimientoModalRegistroMasivo } from './EstablecimientoModalRegistroMasivo';
import { ColumnDef } from '@tanstack/react-table';

interface Establecimiento {
    id_store_client: number;
    id_store: number;
    id_client: number;
    id_usercreator: number;
    i_status: boolean;
    dt_created: string;
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

export function EstablecimientosAdministradoresClients(){
    const [loading, setLoading] = useState(false);
    const [establecimientos, setEstablecimientos] = useState<Array<any>>([]);

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
            header: "Colonia o Fraccionamiento",
        },
        {
            accessorKey: "municipality",
            header: "Municipio o Delegación",
        },
        {
            accessorKey: "state",
            header: "Estado o Provincia",
        },
        {
            accessorKey: "postal_code",
            header: "Código Postal",
        },
        {
            accessorKey: "country",
            header: "País",
        },
    ];

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Establecimientos</h1>
                    <p className="text-sm text-gray-500 mt-1">Administra los establecimeintos</p>
                </div>

                <div className="flex gap-4">
                    <Link to="/producto">
                        <Button className="flex items-center gap-2">
                            <Plus size={18} />
                            Nuevo Establecimiento
                        </Button>
                    </Link>

                    <EstablecimientoModalRegistroMasivo />
                </div>
            </div>

            {/* Loading state */}
            {loading && (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
            )}

            {!loading && (
                <>
                    {/* DataTable */}
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
                </>
            )}
        </>
    )
}