import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PageHeader } from '../components/ui/page-header';
import { PreguntasTable } from '../components/ui/preguntas-table';
import { PreguntaModal } from '../components/ui/pregunta-modal';
import { ActionCard } from '../components/ui/action-card';
import { InfoCard } from '../components/ui/info-card';
import { LoadingButton } from '../components/ui/loading-button';
import { 
  Pregunta, 
  getAllPreguntas, 
  createPregunta, 
  updatePregunta, 
  deletePregunta,
  getPreguntasByTipo,
  getPreguntasByEvidencia
} from '../Fetch/preguntas';

const Preguntas: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEvidencia, setFilterEvidencia] = useState<string>('');
  const [searching, setSearching] = useState(false);

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPregunta, setSelectedPregunta] = useState<Pregunta | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados de acciones
  const [deletingId, setDeletingId] = useState<number | undefined>();

  // Estadísticas calculadas
  const stats = {
    total: preguntas.length,
    activas: preguntas.filter(p => p.b_estatus !== false).length,
    inactivas: preguntas.filter(p => p.b_estatus === false).length,
    conEvidencia: preguntas.filter(p => p.b_evidencia === true).length,
    requeridas: preguntas.filter(p => p.b_requerido === true).length
  };

  // Cargar preguntas
  const loadPreguntas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllPreguntas();

      if (response.ok && response.data) {
        setPreguntas(response.data);
      } else {
        setError(response.message || 'Error al cargar preguntas');
      }
    } catch (err) {
      console.error('Error cargando preguntas:', err);
      setError('Error de conexión al cargar preguntas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar preguntas por búsqueda y filtros
  const filteredPreguntas = preguntas.filter(pregunta => {
    const matchesSearch = searchTerm === '' || 
      pregunta.vc_pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pregunta.vc_tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filterTipo === '' || pregunta.vc_tipo === filterTipo;
    
    const matchesEvidencia = filterEvidencia === '' || 
      (filterEvidencia === 'true' && pregunta.b_evidencia === true) ||
      (filterEvidencia === 'false' && pregunta.b_evidencia === false);
    
    return matchesSearch && matchesTipo && matchesEvidencia;
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadPreguntas();
  }, [loadPreguntas]);

  // Handlers del modal
  const handleCreateNew = () => {
    setSelectedPregunta(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (pregunta: Pregunta) => {
    setSelectedPregunta(pregunta);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (pregunta: Pregunta) => {
    setSelectedPregunta(pregunta);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPregunta(null);
    setModalLoading(false);
  };

  // Crear/Editar pregunta
  const handleSubmitPregunta = async (formData: Pregunta) => {
    setModalLoading(true);
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await createPregunta(formData);
      } else {
        response = await updatePregunta(selectedPregunta!.id_pregunta!, formData);
      }

      if (response.ok) {
        await loadPreguntas();
        handleCloseModal();
      } else {
        throw new Error(response.message || 'Error al guardar pregunta');
      }
    } catch (error) {
      console.error('Error en submit:', error);
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  // Eliminar pregunta
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deletePregunta(id);
      
      if (response.ok) {
        await loadPreguntas();
      } else {
        alert(response.message || 'Error al eliminar pregunta');
      }
    } catch (error) {
      console.error('Error eliminando pregunta:', error);
      alert('Error de conexión al eliminar pregunta');
    } finally {
      setDeletingId(undefined);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterTipo('');
    setFilterEvidencia('');
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Preguntas"
          subtitle="Error al cargar datos"
          actions={[
            {
              label: "Reintentar",
              onClick: () => loadPreguntas(),
              variant: "outline"
            }
          ]}
        />
        <InfoCard
          title="Error de Conexión"
          items={[
            {
              label: "Mensaje",
              value: <span className="text-error">{error}</span>
            }
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Preguntas"
        subtitle={`Gestiona y administra todas las preguntas del sistema`}
        breadcrumbs={[
          { label: "Inicio", onClick: () => navigate('/') },
          { label: "Preguntas" }
        ]}
        actions={[
          {
            label: "Nueva Pregunta",
            onClick: handleCreateNew,
            variant: "default",
            icon: "❓"
          }
        ]}
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-secondary">Total</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.activas}</div>
          <div className="text-sm text-secondary">Activas</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-error">{stats.inactivas}</div>
          <div className="text-sm text-secondary">Inactivas</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-info">{stats.conEvidencia}</div>
          <div className="text-sm text-secondary">Con Evidencia</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.requeridas}</div>
          <div className="text-sm text-secondary">Requeridas</div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <ActionCard
        title="Búsqueda y Filtros"
        subtitle="Encuentra preguntas rápidamente"
        actions={[]}
      >
        <div className="space-y-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                placeholder="Buscar por texto de pregunta o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="custom-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="custom-input w-full"
              >
                <option value="">Todos los tipos</option>
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="date">Fecha</option>
                <option value="select">Selección</option>
                <option value="boolean">Sí/No</option>
              </select>
            </div>
            
            <div>
              <select
                value={filterEvidencia}
                onChange={(e) => setFilterEvidencia(e.target.value)}
                className="custom-input w-full"
              >
                <option value="">Todas las evidencias</option>
                <option value="true">Con evidencia</option>
                <option value="false">Sin evidencia</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              {(searchTerm || filterTipo || filterEvidencia) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="btn-outline flex-1"
                >
                  ✨ Limpiar
                </Button>
              )}
              
              <LoadingButton
                onClick={() => loadPreguntas()}
                loading={loading}
                variant="secondary"
                className="btn-secondary flex-1"
              >
                🔄 Actualizar
              </LoadingButton>
            </div>
          </div>
        </div>
      </ActionCard>

      {/* Tabla de preguntas */}
      <div className="space-y-4">
        {searching && (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-secondary">Buscando preguntas...</p>
          </div>
        )}
        
        <PreguntasTable
          preguntas={filteredPreguntas}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          deletingId={deletingId}
        />
      </div>

      {/* Modal */}
      <PreguntaModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPregunta}
        pregunta={selectedPregunta}
        loading={modalLoading}
        mode={modalMode}
      />
    </div>
  );
};

export default Preguntas;