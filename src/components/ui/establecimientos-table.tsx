import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { StatusBadge } from './status-badge';
import { LoadingButton } from './loading-button';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Establecimiento } from '../../Fetch/establecimientos';

interface EstablecimientosTableProps {
  establecimientos: Establecimiento[];
  loading?: boolean;
  onEdit?: (establecimiento: Establecimiento) => void;
  onDelete?: (id: number) => void;
  onView?: (establecimiento: Establecimiento) => void;
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

const formatCoordinates = (lat?: number, lng?: number) => {
  if (!lat || !lng) return "No disponible";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const EstablecimientosTable: React.FC<EstablecimientosTableProps> = ({
  establecimientos,
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
                  <TableHead>Dirección</TableHead>
                  <TableHead>N° Económico</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><div className="loading-skeleton h-4 w-8"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-32"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-40"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-20"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-24"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-20"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-32"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-6 w-16"></div></TableCell>
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

  if (establecimientos.length === 0) {
    return (
      <Card className="custom-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            No hay establecimientos
          </h3>
          <p className="text-secondary text-center max-w-md">
            No se encontraron establecimientos. Crea el primero para comenzar.
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
                <TableHead className="font-semibold">Dirección</TableHead>
                <TableHead className="font-semibold">N° Económico</TableHead>
                <TableHead className="font-semibold">Teléfono</TableHead>
                <TableHead className="font-semibold">Marca</TableHead>
                <TableHead className="font-semibold">Coordenadas</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Registro</TableHead>
                <TableHead className="text-center font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {establecimientos.map((establecimiento, index) => (
                <TableRow 
                  key={establecimiento.id_establecimiento || index}
                  className="hover:bg-hover transition-colors duration-200 fade-in border-b border-border"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-center font-medium text-secondary">
                    {index + 1}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-primary">
                        {establecimiento.vc_nombre}
                      </span>
                      {establecimiento.id_establecimiento && (
                        <span className="text-xs text-secondary">
                          ID: {establecimiento.id_establecimiento}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-primary">
                      {establecimiento.vc_direccion || 
                        <span className="text-secondary italic">Sin dirección</span>
                      }
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center">
                      {establecimiento.vc_num_economico ? (
                        <span className="bg-accent text-black px-2 py-1 rounded text-xs font-mono">
                          {establecimiento.vc_num_economico}
                        </span>
                      ) : (
                        <span className="text-secondary italic">Sin número</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-primary">
                      {establecimiento.vc_telefono || 
                        <span className="text-secondary italic">Sin teléfono</span>
                      }
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-primary">
                      {establecimiento.vc_marca || 
                        <span className="text-secondary italic">Sin marca</span>
                      }
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-xs font-mono text-primary">
                      {formatCoordinates(establecimiento.i_latitud, establecimiento.i_longitud)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge
                      status={establecimiento.b_estatus !== false ? 'active' : 'inactive'}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-secondary">
                      {formatDate(establecimiento.dt_registro)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(establecimiento)}
                          className="h-8 w-8 p-0 hover:bg-info hover:text-white transition-colors"
                          title="Ver detalles"
                        >
                          👁️
                        </Button>
                      )}
                      
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(establecimiento)}
                          className="h-8 w-8 p-0 hover:bg-warning hover:text-black transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </Button>
                      )}
                      
                      {onDelete && (
                        <LoadingButton
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(establecimiento.id_establecimiento!)}
                          loading={deletingId === establecimiento.id_establecimiento}
                          disabled={deletingId === establecimiento.id_establecimiento}
                          className="h-8 w-8 p-0 hover:bg-error hover:text-white transition-colors"
                          title="Eliminar"
                        >
                          🗑️
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