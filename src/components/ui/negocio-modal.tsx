import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { LoadingButton } from './loading-button';
import { Button } from './button';
import { Negocio } from '../../Fetch/negocios';

interface NegocioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (negocio: Negocio) => Promise<void>;
  negocio?: Negocio | null;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const initialForm: Negocio = {
  id_negocio: 0,
  vc_nombre: '',
  b_activo: true,
};

const validateForm = (form: Negocio): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!form.vc_nombre.trim()) {
    errors.vc_nombre = 'El nombre del negocio es requerido';
  }

  if (form.vc_nombre.length > 255) {
    errors.vc_nombre = 'El nombre no puede exceder 255 caracteres';
  }

  return errors;
};

export const NegocioModal: React.FC<NegocioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  negocio,
  mode
}) => {
  const [formData, setFormData] = useState<Negocio>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadonly = mode === 'view';
  const isEditing = mode === 'edit';

  useEffect(() => {
    if (negocio && isOpen) {
      setFormData({
        ...negocio,
        vc_nombre: negocio.vc_nombre || '',
        b_activo: negocio.b_activo !== false,
      });
    } else if (isOpen && mode === 'create') {
      setFormData(initialForm);
    }
    setErrors({});
  }, [negocio, isOpen, mode]);

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

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nuevo Negocio';
      case 'edit': return `Editar: ${negocio?.vc_nombre}`;
      case 'view': return `Detalles: ${negocio?.vc_nombre}`;
      default: return 'Negocio';
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
      <DialogContent className="sm:max-w-[500px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <span className="text-2xl">🏢</span>
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

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-primary flex items-center gap-1">
                Nombre del Negocio
                {!isReadonly && <span className="text-error">*</span>}
              </Label>
              <Input
                id="nombre"
                value={formData.vc_nombre}
                onChange={(e) => setFormData({...formData, vc_nombre: e.target.value})}
                placeholder="Ej: Tienda El Sol"
                className={`custom-input ${errors.vc_nombre ? 'error-input' : ''}`}
                disabled={isReadonly}
                maxLength={255}
              />
              {errors.vc_nombre && (
                <p className="error-text">{errors.vc_nombre}</p>
              )}
              {!isReadonly && (
                <p className="text-sm text-secondary">
                  {formData.vc_nombre.length}/255 caracteres
                </p>
              )}
            </div>

            {/* Estado del negocio (solo en editar y ver) */}
            {(isEditing || isReadonly) && (
              <div className="space-y-2">
                <Label className="text-primary">Estado del Negocio</Label>
                {isReadonly ? (
                  <div className="flex items-center gap-2">
                    {formData.b_activo ? (
                      <span className="bg-success text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        ✅ Activo
                      </span>
                    ) : (
                      <span className="bg-error text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        ❌ Inactivo
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="activo"
                        checked={formData.b_activo === true}
                        onChange={() => setFormData({...formData, b_activo: true})}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-primary">Activo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="activo"
                        checked={formData.b_activo === false}
                        onChange={() => setFormData({...formData, b_activo: false})}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-primary">Inactivo</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información de sistema (solo en modo ver/editar) */}
          {(isEditing || isReadonly) && negocio && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-info rounded-full"></div>
                <h3 className="text-lg font-semibold text-primary">Información del Sistema</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-secondary">ID del Negocio</Label>
                  <p className="text-primary font-mono">{negocio.id_negocio}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Estado</Label>
                  <p className="text-primary">
                    {negocio.b_activo !== false ? 
                      <span className="text-success">✅ Activo</span> : 
                      <span className="text-error">❌ Inactivo</span>
                    }
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Fecha de Registro</Label>
                  <p className="text-primary">{formatDate(negocio.dt_registro)}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Última Actualización</Label>
                  <p className="text-primary">{formatDate(negocio.dt_actualizacion)}</p>
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
                {mode === 'create' ? '✨ Crear Negocio' : '💾 Guardar Cambios'}
              </LoadingButton>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};