import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { StatusBadge } from './status-badge';
import { LoadingButton } from './loading-button';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Pregunta } from '../../Fetch/preguntas';

interface PreguntasTableProps {
  preguntas: Pregunta[];
  loading?: boolean;
  onEdit?: (pregunta: Pregunta) => void;
  onDelete?: (id: number) => void;
  onView?: (pregunta: Pregunta) => void;
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

const getTipoLabel = (tipo: string) => {
  const tipos = {
    'text': 'Texto',
    'number': 'Número',
    'date': 'Fecha',
    'select': 'Selección',
    'boolean': 'Sí/No'
  };
  return tipos[tipo as keyof typeof tipos] || tipo;
};

const getTipoIcon = (tipo: string) => {
  const iconos = {
    'text': '📝',
    'number': '🔢',
    'date': '📅',
    'select': '📋',
    'boolean': '✅'
  };
  return iconos[tipo as keyof typeof iconos] || '❓';
};

export const PreguntasTable: React.FC<PreguntasTableProps> = ({
  preguntas,
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
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Evidencia</TableHead>
                  <TableHead>Requerido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><div className="loading-skeleton h-4 w-8"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-64"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-20"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-16"></div></TableCell>
                    <TableCell><div className="loading-skeleton h-4 w-16"></div></TableCell>
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

  if (preguntas.length === 0) {
    return (
      <Card className="custom-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            No hay preguntas
          </h3>
          <p className="text-secondary text-center max-w-md">
            No se encontraron preguntas. Crea la primera para comenzar.
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
                <TableHead className="font-semibold">Pregunta</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Evidencia</TableHead>
                <TableHead className="font-semibold">Requerido</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Registro</TableHead>
                <TableHead className="text-center font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preguntas.map((pregunta, index) => (
                <TableRow 
                  key={pregunta.id_pregunta || index}
                  className="hover:bg-hover transition-colors duration-200 fade-in border-b border-border"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="text-center font-medium text-secondary">
                    {index + 1}
                  </TableCell>
                  
                  <TableCell className="max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-primary leading-tight">
                        {pregunta.vc_pregunta.length > 60 
                          ? `${pregunta.vc_pregunta.substring(0, 60)}...`
                          : pregunta.vc_pregunta
                        }
                      </span>
                      {pregunta.id_pregunta && (
                        <span className="text-xs text-secondary">
                          ID: {pregunta.id_pregunta}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTipoIcon(pregunta.vc_tipo)}</span>
                      <span className="text-primary font-medium">
                        {getTipoLabel(pregunta.vc_tipo)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {pregunta.b_evidencia ? (
                        <span className="bg-info text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          📷 Sí
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          📝 No
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {pregunta.b_requerido ? (
                        <span className="bg-warning text-black px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          ⚠️ Sí
                        </span>
                      ) : (
                        <span className="bg-success text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          ✅ No
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge
                      status={pregunta.b_estatus !== false ? 'active' : 'inactive'}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-secondary">
                      {formatDate(pregunta.dt_registro)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(pregunta)}
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
                          onClick={() => onEdit(pregunta)}
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
                          onClick={() => onDelete(pregunta.id_pregunta!)}
                          loading={deletingId === pregunta.id_pregunta}
                          disabled={deletingId === pregunta.id_pregunta}
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