import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Input } from './input';
import { Label } from './label';
import { LoadingButton } from './loading-button';
import { Button } from './button';
import { Textarea } from './textarea';
import { Pregunta } from '../../Fetch/preguntas';

interface PreguntaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pregunta: Pregunta) => Promise<void>;
  pregunta?: Pregunta | null;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const initialForm: Pregunta = {
  vc_pregunta: '',
  vc_tipo: 'text',
  b_evidencia: false,
  b_requerido: false,
};

const tiposPregunta = [
  { value: 'text', label: 'Texto' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selección múltiple' },
  { value: 'boolean', label: 'Sí/No' },
];

const validateForm = (form: Pregunta): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!form.vc_pregunta.trim()) {
    errors.vc_pregunta = 'La pregunta es requerida';
  }

  if (!form.vc_tipo) {
    errors.vc_tipo = 'El tipo de pregunta es requerido';
  }

  return errors;
};

export const PreguntaModal: React.FC<PreguntaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  pregunta,
  loading = false,
  mode
}) => {
  const [formData, setFormData] = useState<Pregunta>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadonly = mode === 'view';
  const isEditing = mode === 'edit';

  useEffect(() => {
    if (pregunta && isOpen) {
      setFormData({
        ...pregunta,
        vc_pregunta: pregunta.vc_pregunta || '',
        vc_tipo: pregunta.vc_tipo || 'text',
        b_evidencia: pregunta.b_evidencia || false,
        b_requerido: pregunta.b_requerido || false,
      });
    } else if (isOpen && mode === 'create') {
      setFormData(initialForm);
    }
    setErrors({});
  }, [pregunta, isOpen, mode]);

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
      case 'create': return 'Nueva Pregunta';
      case 'edit': return `Editar: ${pregunta?.vc_pregunta?.substring(0, 30)}...`;
      case 'view': return `Detalles: ${pregunta?.vc_pregunta?.substring(0, 30)}...`;
      default: return 'Pregunta';
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
            <span className="text-2xl">❓</span>
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
              <Label htmlFor="pregunta" className="text-primary flex items-center gap-1">
                Texto de la Pregunta
                {!isReadonly && <span className="text-error">*</span>}
              </Label>
              <Textarea
                id="pregunta"
                value={formData.vc_pregunta}
                onChange={(e) => setFormData({...formData, vc_pregunta: e.target.value})}
                placeholder="Ej: ¿Cuál es tu edad?"
                className={`custom-input min-h-[100px] ${errors.vc_pregunta ? 'error-input' : ''}`}
                disabled={isReadonly}
              />
              {errors.vc_pregunta && (
                <p className="error-text">{errors.vc_pregunta}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-primary flex items-center gap-1">
                Tipo de Pregunta
                {!isReadonly && <span className="text-error">*</span>}
              </Label>
              <select
                id="tipo"
                value={formData.vc_tipo}
                onChange={(e) => setFormData({...formData, vc_tipo: e.target.value})}
                className={`custom-input w-full ${errors.vc_tipo ? 'error-input' : ''}`}
                disabled={isReadonly}
              >
                {tiposPregunta.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.vc_tipo && (
                <p className="error-text">{errors.vc_tipo}</p>
              )}
            </div>
          </div>

          {/* Configuración */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent rounded-full"></div>
              <h3 className="text-lg font-semibold text-primary">Configuración</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-primary">Evidencia Requerida</Label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="evidencia"
                      checked={formData.b_evidencia === true}
                      onChange={() => setFormData({...formData, b_evidencia: true})}
                      disabled={isReadonly}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-primary">Sí</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="evidencia"
                      checked={formData.b_evidencia === false}
                      onChange={() => setFormData({...formData, b_evidencia: false})}
                      disabled={isReadonly}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-primary">No</span>
                  </label>
                </div>
                <p className="text-sm text-secondary">
                  {formData.b_evidencia ? 
                    '📷 Se requerirá evidencia fotográfica' : 
                    '📝 Solo se capturará la respuesta'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-primary">Pregunta Requerida</Label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="requerido"
                      checked={formData.b_requerido === true}
                      onChange={() => setFormData({...formData, b_requerido: true})}
                      disabled={isReadonly}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-primary">Sí</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="requerido"
                      checked={formData.b_requerido === false}
                      onChange={() => setFormData({...formData, b_requerido: false})}
                      disabled={isReadonly}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-primary">No</span>
                  </label>
                </div>
                <p className="text-sm text-secondary">
                  {formData.b_requerido ? 
                    '⚠️ Esta pregunta debe ser respondida obligatoriamente' : 
                    '✅ Esta pregunta es opcional'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Información de sistema (solo en modo ver/editar) */}
          {(isEditing || isReadonly) && pregunta && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-info rounded-full"></div>
                <h3 className="text-lg font-semibold text-primary">Información del Sistema</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-secondary">ID de la Pregunta</Label>
                  <p className="text-primary font-mono">{pregunta.id_pregunta}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Estado</Label>
                  <p className="text-primary">
                    {pregunta.b_estatus !== false ? 
                      <span className="text-success">✅ Activa</span> : 
                      <span className="text-error">❌ Inactiva</span>
                    }
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Fecha de Registro</Label>
                  <p className="text-primary">{formatDate(pregunta.dt_registro)}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-secondary">Última Actualización</Label>
                  <p className="text-primary">{formatDate(pregunta.dt_actualizacion)}</p>
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
                {mode === 'create' ? '✨ Crear Pregunta' : '💾 Guardar Cambios'}
              </LoadingButton>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};