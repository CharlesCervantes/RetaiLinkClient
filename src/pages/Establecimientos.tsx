import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PageHeader } from '../components/ui/page-header';
import { EstablecimientosTable } from '../components/ui/establecimientos-table';
import { EstablecimientoModal } from '../components/ui/establecimiento-modal';
import { ActionCard } from '../components/ui/action-card';
import { InfoCard } from '../components/ui/info-card';
import { LoadingButton } from '../components/ui/loading-button';
import { 
  Establecimiento, 
  getAllEstablecimientos, 
  createEstablecimiento, 
  updateEstablecimiento, 
  deleteEstablecimiento,
  searchEstablecimientos 
} from '../Fetch/establecimientos';

const Establecimientos: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<Establecimiento | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados de acciones
  const [deletingId, setDeletingId] = useState<number | undefined>();

  // Estadísticas calculadas
  const stats = {
    total: establecimientos.length,
    activos: establecimientos.filter(e => e.b_estatus !== false).length,
    inactivos: establecimientos.filter(e => e.b_estatus === false).length,
    conUbicacion: establecimientos.filter(e => e.i_latitud && e.i_longitud).length
  };

  // Cargar establecimientos
  const loadEstablecimientos = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = search 
        ? await searchEstablecimientos(search)
        : await getAllEstablecimientos();

      if (response.ok && response.data) {
        setEstablecimientos(response.data);
      } else {
        setError(response.message || 'Error al cargar establecimientos');
      }
    } catch (err) {
      console.error('Error cargando establecimientos:', err);
      setError('Error de conexión al cargar establecimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setSearching(true);
        loadEstablecimientos(searchTerm).finally(() => setSearching(false));
      } else if (searchTerm === '') {
        loadEstablecimientos();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadEstablecimientos]);

  // Cargar datos iniciales
  useEffect(() => {
    loadEstablecimientos();
  }, [loadEstablecimientos]);

  // Handlers del modal
  const handleCreateNew = () => {
    setSelectedEstablecimiento(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEstablecimiento(null);
    setModalLoading(false);
  };

  // Crear/Editar establecimiento
  const handleSubmitEstablecimiento = async (formData: Establecimiento) => {
    setModalLoading(true);
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await createEstablecimiento(formData);
      } else {
        response = await updateEstablecimiento(selectedEstablecimiento!.id_establecimiento!, formData);
      }

      if (response.ok) {
        await loadEstablecimientos();
        handleCloseModal();
      } else {
        throw new Error(response.message || 'Error al guardar establecimiento');
      }
    } catch (error) {
      console.error('Error en submit:', error);
      throw error; // Re-throw para que el modal maneje el error
    } finally {
      setModalLoading(false);
    }
  };

  // Eliminar establecimiento
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este establecimiento?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deleteEstablecimiento(id);
      
      if (response.ok) {
        await loadEstablecimientos();
      } else {
        alert(response.message || 'Error al eliminar establecimiento');
      }
    } catch (error) {
      console.error('Error eliminando establecimiento:', error);
      alert('Error de conexión al eliminar establecimiento');
    } finally {
      setDeletingId(undefined);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    loadEstablecimientos();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Establecimientos"
          subtitle="Error al cargar datos"
          actions={[
            {
              label: "Reintentar",
              onClick: () => loadEstablecimientos(),
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
        title="Establecimientos"
        subtitle={`Gestiona y administra todos los establecimientos del sistema`}
        breadcrumbs={[
          { label: "Inicio", onClick: () => navigate('/') },
          { label: "Establecimientos" }
        ]}
        actions={[
          {
            label: "Nuevo Establecimiento",
            onClick: handleCreateNew,
            variant: "default",
            icon: "🏪"
          }
        ]}
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-secondary">Total</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.activos}</div>
          <div className="text-sm text-secondary">Activos</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-error">{stats.inactivos}</div>
          <div className="text-sm text-secondary">Inactivos</div>
        </div>
        
        <div className="custom-card p-4 text-center">
          <div className="text-2xl font-bold text-info">{stats.conUbicacion}</div>
          <div className="text-sm text-secondary">Con Ubicación</div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <ActionCard
        title="Búsqueda y Filtros"
        subtitle="Encuentra establecimientos rápidamente"
        actions={[]}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, dirección, teléfono o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input"
            />
          </div>
          
          {searchTerm && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="btn-outline"
            >
              ✨ Limpiar
            </Button>
          )}
          
          <LoadingButton
            onClick={() => loadEstablecimientos()}
            loading={loading}
            variant="secondary"
            className="btn-secondary"
          >
            🔄 Actualizar
          </LoadingButton>
        </div>
      </ActionCard>

      {/* Tabla de establecimientos */}
      <div className="space-y-4">
        {searching && (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-secondary">Buscando establecimientos...</p>
          </div>
        )}
        
        <EstablecimientosTable
          establecimientos={establecimientos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          deletingId={deletingId}
        />
      </div>

      {/* Modal */}
      <EstablecimientoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEstablecimiento}
        establecimiento={selectedEstablecimiento}
        loading={modalLoading}
        mode={modalMode}
      />
    </div>
  );
};

export default Establecimientos;