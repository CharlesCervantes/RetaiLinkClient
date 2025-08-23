import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { LoadingButton } from './loading-button';
import { Button } from './button';
import { Textarea } from './textarea';
import { Establecimiento } from '../../Fetch/establecimientos';

interface EstablecimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (establecimiento: Establecimiento) => Promise<void>;
  establecimiento?: Establecimiento | null;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const initialForm: Establecimiento = {
  vc_nombre: '',
  vc_direccion: '',
  vc_num_economico: '',
  vc_telefono: '',
  vc_marca: '',
  i_latitud: undefined,
  i_longitud: undefined,
};

const validateForm = (form: Establecimiento): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!form.vc_nombre.trim()) {
    errors.vc_nombre = 'El nombre es requerido';
  }

  if (form.vc_telefono && !/^\d{10}$/.test(form.vc_telefono.replace(/\D/g, ''))) {
    errors.vc_telefono = 'El teléfono debe tener 10 dígitos';
  }

  if (form.i_latitud !== undefined && (form.i_latitud < -90 || form.i_latitud > 90)) {
    errors.i_latitud = 'La latitud debe estar entre -90 y 90';
  }

  if (form.i_longitud !== undefined && (form.i_longitud < -180 || form.i_longitud > 180)) {
    errors.i_longitud = 'La longitud debe estar entre -180 y 180';
  }

  return errors;
};

export const EstablecimientoModal: React.FC<EstablecimientoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  establecimiento,
  loading = false,
  mode
}) => {
  const [formData, setFormData] = useState<Establecimiento>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadonly = mode === 'view';
  const isEditing = mode === 'edit';

  useEffect(() => {
    if (establecimiento && isOpen) {
      setFormData({
        ...establecimiento,
        vc_nombre: establecimiento.vc_nombre || '',
        vc_direccion: establecimiento.vc_direccion || '',
        vc_num_economico: establecimiento.vc_num_economico || '',
        vc_telefono: establecimiento.vc_telefono || '',
        vc_marca: establecimiento.vc_marca || '',
      });
    } else if (isOpen && mode === 'create') {
      setFormData(initialForm);
    }
    setErrors({});
  }, [establecimiento, isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReadonly) return;

    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData(initialForm);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setErrors({ general: 'Error al guardar. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData(initialForm);
    setErrors({});
    onClose();
  };

  const getLocationFromBrowser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            i_latitud: position.coords.latitude,
            i_longitud: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setErrors(prev => ({...prev, location: 'No se pudo obtener la ubicación'}));
        }
      );
    } else {
      setErrors(prev => ({...prev, location: 'Geolocalización no disponible'}));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nuevo Establecimiento';
      case 'edit': return `Editar: ${establecimiento?.vc_nombre}`;
      case 'view': return `Detalles: ${establecimiento?.vc_nombre}`;
      default: return 'Establecimiento';
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "No disponible";
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent rounded-full"></div>
              <h3 className="text-lg font-semibold text-primary">Información Básica</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-primary flex items-center gap-1">
                  Nombre del Establecimiento
                  {!isReadonly && <span className="text-error">*</span>}
                </Label>
                <Input
                  id="nombre"
                  value={formData.vc_nombre}
                  onChange={(e) => setFormData({...formData, vc_nombre: e.target.value})}
                  placeholder="Ej: Tienda Central"
                  className={`custom-input ${errors.vc_nombre ? 'error-input' : ''}`}
                  disabled={isReadonly}
                />
                {errors.vc_nombre && (
                  <p className="error-text">{errors.vc_nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_economico" className="text-primary">
                  Número Económico
                </Label>
                <Input
                  id="num_economico"
                  value={formData.vc_num_economico}
                  onChange={(e) => setFormData({...formData, vc_num_economico: e.target.value})}
                  placeholder="Ej: EST-001"
                  className="custom-input"
                  disabled={isReadonly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-primary">Dirección</Label>
              <Textarea
                id="direccion"
                value={formData.vc_direccion}
                onChange={(e) => setFormData({...formData, vc_direccion: e.target.value})}
                placeholder="Ej: Av. Principal #123, Col. Centro"
                className="custom-input min-h-[80px]"
                disabled={isReadonly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-primary">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.vc_telefono}
                  onChange={(e) => setFormData({...formData, vc_telefono: e.target.value})}
                  placeholder="Ej: 5512345678"
                  className={`custom-input ${errors.vc_telefono ? 'error-input' : ''}`}
                  disabled={isReadonly}
                />
                {errors.vc_telefono && (
                  <p className="error-text">{errors.vc_telefono}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca" className="text-primary">Marca</Label>
                <Input
                  id="marca"
                  value={formData.vc_marca}
                  onChange={(e) => setFormData({...formData, vc_marca: e.target.value})}
                  placeholder="Ej: OXXO, 7-Eleven"
                  className="custom-input"
                  disabled={isReadonly}
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent rounded-full"></div>
              <h3 className="text-lg font-semibold text-primary">Ubicación</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitud" className="text-primary">Latitud</Label>
                <Input
                  id="latitud"
                  type="number"
                  step="any"
                  value={formData.i_latitud || ''}
                  onChange={(e) => setFormData({...formData, i_latitud: parseFloat(e.target.value) || undefined})}
                  placeholder="Ej: 19.432608"
                  className={`custom-input ${errors.i_latitud ? 'error-input' : ''}`}
                  disabled={isReadonly}
                />
                {errors.i_latitud && (
                  <p className="error-text">{errors.i_latitud}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitud" className="text-primary">Longitud</Label>
                <Input
                  id="longitud"
                  type="number"
                  step="any"
                  value={formData.i_longitud || ''}
                  onChange={(e) => setFormData({...formData, i_longitud: parseFloat(e.target.value) || undefined})}
                  placeholder="Ej: -99.133209"
                  className={`custom-input ${errors.i_longitud ? 'error-input' : ''}`}
                  disabled={isReadonly}
                />
                {errors.i_longitud && (
                  <p className="error-text">{errors.i_longitud}</p>
                )}
              </div>
            </div>

            {!isReadonly && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getLocationFromBrowser}
                  className="btn-outline flex items-center gap-2"
                >
                  📍 Obtener ubicación actual
                </Button>
                {errors.location && (
                  <p className="error-text mt-2">{errors.location}</p>
                )}
              </div>
            )}
          </div>

          {/* Información de sistema (solo en modo ver/editar) */}
          {(isEditing || isReadonly) && establecimiento && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-info rounded-full"></div>
                <h3 className="text-lg font-semibold text-primary">Información del Sistema</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-secondary">ID del Establecimiento</Label>
                  <p className="text-primary font-mono">{establecimiento.id_establecimiento}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Estado</Label>
                  <p className="text-primary">
                    {establecimiento.b_estatus !== false ? 
                      <span className="text-success">✅ Activo</span> : 
                      <span className="text-error">❌ Inactivo</span>
                    }
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Fecha de Registro</Label>
                  <p className="text-primary">{formatDate(establecimiento.dt_registro)}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Última Actualización</Label>
                  <p className="text-primary">{formatDate(establecimiento.dt_actualizacion)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error general */}
          {errors.general && (
            <div className="bg-error bg-opacity-10 border border-error rounded-lg p-3">
              <p className="error-text text-center">{errors.general}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              {isReadonly ? 'Cerrar' : 'Cancelar'}
            </Button>
            
            {!isReadonly && (
              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText={mode === 'create' ? 'Creando...' : 'Guardando...'}
                className="btn-primary"
              >
                {mode === 'create' ? '✨ Crear Establecimiento' : '💾 Guardar Cambios'}
              </LoadingButton>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};