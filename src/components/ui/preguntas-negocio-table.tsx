import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { StatusBadge } from './status-badge';
import { LoadingButton } from './loading-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { cn } from '../../lib/utils';
import { PreguntaNegocio } from '../../Fetch/preguntas';

interface PreguntasNegocioTableProps {
  preguntas: PreguntaNegocio[];
  title?: string;
  loading?: boolean;
  onCreatePregunta?: () => void;
  creatingPregunta?: boolean;
  renderPreguntaActions?: (pregunta: PreguntaNegocio) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  showCreateButton?: boolean;
  createPreguntaModal?: React.ReactNode;
}

export const PreguntasNegocioTable: React.FC<PreguntasNegocioTableProps> = ({
  preguntas,
  title = 'Preguntas del Negocio',
  loading = false,
  onCreatePregunta,
  creatingPregunta = false,
  renderPreguntaActions,
  className,
  emptyMessage = 'No hay preguntas registradas para este negocio.',
  showCreateButton = false,
  createPreguntaModal
}) => {
  if (loading) {
    return (
      <Card className={cn('custom-card fade-in', className)}>
        <CardHeader>
          <div className="loading-skeleton h-6 w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-primary rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="loading-skeleton h-4 w-16"></div>
                    <div className="loading-skeleton h-5 w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="loading-skeleton h-4 w-16"></div>
                    <div className="loading-skeleton h-5 w-40"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="loading-skeleton h-4 w-16"></div>
                    <div className="loading-skeleton h-5 w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="loading-skeleton h-4 w-16"></div>
                    <div className="loading-skeleton h-6 w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTipo = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      'text': 'Texto',
      'number': 'Número',
      'date': 'Fecha',
      'boolean': 'Sí/No',
      'photo': 'Foto'
    };
    return tipos[tipo] || tipo;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  return (
    <Card className={cn('custom-card fade-in', className)}>
      <CardHeader>
        <CardTitle className="text-primary flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          {showCreateButton && onCreatePregunta && (
            <>
              {createPreguntaModal ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <LoadingButton
                      variant="default"
                      loading={creatingPregunta}
                      loadingText="Creando..."
                      className="btn-primary"
                    >
                      Crear Pregunta
                    </LoadingButton>
                  </DialogTrigger>
                  {createPreguntaModal}
                </Dialog>
              ) : (
                <LoadingButton
                  variant="default"
                  onClick={onCreatePregunta}
                  loading={creatingPregunta}
                  loadingText="Creando..."
                  className="btn-primary"
                >
                  Crear Pregunta
                </LoadingButton>
              )}
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {preguntas.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary text-lg mb-2">❓</div>
            <p className="text-secondary">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {preguntas.map((pregunta, index) => (
              <div
                key={pregunta.id_pregunta || index}
                className="border border-primary rounded-lg p-4 hover:shadow-md transition-shadow slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-start">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Pregunta
                    </label>
                    <p className="text-primary font-medium">
                      {pregunta.vc_pregunta || 'No disponible'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Tipo
                    </label>
                    <p className="text-primary">
                      {formatTipo(pregunta.vc_tipo)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Precio
                    </label>
                    <p className="text-primary font-semibold">
                      {formatPrice(pregunta.dc_precio)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Estado
                    </label>
                    <div>
                      <StatusBadge
                        status={pregunta.b_activo ? 'active' : 'inactive'}
                      />
                    </div>
                  </div>
                  
                  {renderPreguntaActions && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-secondary">
                        Acciones
                      </label>
                      <div className="flex gap-2">
                        {renderPreguntaActions(pregunta)}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-secondary">
                    <div className="flex items-center gap-1">
                      <span className={pregunta.b_photo ? 'text-success' : 'text-secondary'}>
                        📷
                      </span>
                      <span>Evidencia: {pregunta.b_photo ? 'Requerida' : 'No requerida'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={pregunta.b_required ? 'text-error' : 'text-secondary'}>
                        {pregunta.b_required ? '❗' : '❔'}
                      </span>
                      <span>{pregunta.b_required ? 'Obligatoria' : 'Opcional'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🆔</span>
                      <span>ID: {pregunta.id_pregunta}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={pregunta.b_estatus ? 'text-success' : 'text-warning'}>
                        {pregunta.b_estatus ? '✅' : '⚠️'}
                      </span>
                      <span>Estado: {pregunta.b_estatus ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};