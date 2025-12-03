import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { StatusBadge } from './status-badge';
import { LoadingButton } from './loading-button';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Negocio } from '../../Fetch/negocios';
import { UsersIcon, GlassesIcon, Edit2Icon, Trash2Icon } from "lucide-react"

interface NegociosTableProps {
  negocios: Negocio[];
  loading?: boolean;
  onEdit?: (negocio: Negocio) => void;
  onDelete?: (id: number) => void;
  onView?: (negocio: Negocio) => void;
  deletingId?: number;
  className?: string;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "No disponible";
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const NegociosTable: React.FC<NegociosTableProps> = ({
  negocios,
  loading = false,
  onEdit,
  onDelete,
  onView,
  deletingId,
  className
}) => {
  if (loading) {
    return (
      <Card className="custom-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Actualización</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><div className="loading-skeleton h-4 w-8"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-48"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-16"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-6 w-16"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-24"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-24"></div></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <div className="loading-skeleton h-8 w-16"></div>
                        <div className="loading-skeleton h-8 w-16"></div>
                        <div className="loading-skeleton h-8 w-16"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (negocios.length === 0) {
    return (
      <Card className="custom-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4"><UsersIcon /></div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            No hay clientes
          </h3>
          <p className="text-secondary text-center max-w-md">
            No se encontraron clientes. Crea el primero para comenzar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`custom-card ${className || ''}`}>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-2 border-accent">
                <TableHead className="w-[50px] text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold">Nombre</TableHead>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Registro</TableHead>
                <TableHead className="font-semibold">Actualización</TableHead>
                <TableHead className="text-center font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {negocios.map((negocio, index) => (
                <TableRow 
                  key={negocio.id_negocio || index}
                  className="hover:bg-hover transition-colors duration-200 fade-in border-b border-border"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-center font-medium text-secondary">
                    {index + 1}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-primary text-lg">
                        {negocio.vc_nombre}
                      </span>
                      <span className="text-xs text-secondary">
                        Cliente #{negocio.id_negocio}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="bg-accent text-black px-3 py-1 rounded text-sm font-mono font-semibold">
                      {negocio.id_negocio}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge
                      status={negocio.b_activo !== false ? 'active' : 'inactive'}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-secondary">
                      {formatDate(negocio.dt_registro)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-secondary">
                      {formatDate(negocio.dt_actualizacion)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(negocio)}
                          className="h-8 w-8 p-0 hover:bg-info hover:text-white transition-colors"
                          title="Ver detalles"
                        >
                          <GlassesIcon />
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(negocio)}
                          className="h-8 w-8 p-0 hover:bg-warning hover:text-black transition-colors"
                          title="Editar"
                        >
                          <Edit2Icon />
                        </Button>
                      )}
                      
                      {onDelete && (
                        <LoadingButton
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(negocio.id_negocio)}
                          loading={deletingId === negocio.id_negocio}
                          disabled={deletingId === negocio.id_negocio}
                          className="h-8 w-8 p-0 hover:bg-error hover:text-white transition-colors"
                          title="Eliminar"
                        >
                          <Trash2Icon />
                        </LoadingButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};