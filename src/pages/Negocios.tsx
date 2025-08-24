import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PageHeader } from '../components/ui/page-header';
import { NegociosTable } from '../components/ui/negocios-table';
import { NegocioModal } from '../components/ui/negocio-modal';
import { ActionCard } from '../components/ui/action-card';
import { InfoCard } from '../components/ui/info-card';
import { LoadingButton } from '../components/ui/loading-button';
import { 
  Negocio, 
  getAllNegocios, 
  createNegocio, 
  updateNegocio, 
  deleteNegocio
} from '../Fetch/negocios';

const Negocios: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedNegocio, setSelectedNegocio] = useState<Negocio | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados de acciones
  const [deletingId, setDeletingId] = useState<number | undefined>();

  // Estadísticas calculadas
  const stats = {
    total: negocios.length,
    activos: negocios.filter(n => n.b_activo !== false).length,
    inactivos: negocios.filter(n => n.b_activo === false).length
  };

  // Cargar negocios
  const loadNegocios = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllNegocios();

      if (response.ok && response.data) {
        let filteredData = response.data;
        if (search) {
          filteredData = response.data.filter(negocio => 
            negocio.vc_nombre.toLowerCase().includes(search.toLowerCase())
          );
        }
        setNegocios(filteredData);
      } else {
        setError(response.message || 'Error al cargar negocios');
      }
    } catch (err) {
      console.error('Error cargando negocios:', err);
      setError('Error de conexión al cargar negocios');
    } finally {
      setLoading(false);
    }
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        setSearching(true);
        loadNegocios(searchTerm).finally(() => setSearching(false));
      } else if (searchTerm === '') {
        loadNegocios();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadNegocios]);

  // Cargar datos iniciales
  useEffect(() => {
    loadNegocios();
  }, [loadNegocios]);

  // Handlers del modal
  const handleCreateNew = () => {
    setSelectedNegocio(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (negocio: Negocio) => {
    setSelectedNegocio(negocio);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleView = (negocio: Negocio) => {
    navigate(`/negocios/${negocio.id_negocio}`, { state: { negocio } });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNegocio(null);
    setModalLoading(false);
  };

  // Crear/Editar negocio
  const handleSubmitNegocio = async (formData: Negocio) => {
    setModalLoading(true);
    try {
      let response;
      
      if (modalMode === 'create') {
        response = await createNegocio(formData.vc_nombre);
      } else {
        response = await updateNegocio(selectedNegocio!.id_negocio, { vc_nombre: formData.vc_nombre });
      }

      if (response.ok) {
        await loadNegocios();
        handleCloseModal();
      } else {
        throw new Error(response.message || 'Error al guardar negocio');
      }
    } catch (error) {
      console.error('Error en submit:', error);
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  // Eliminar negocio
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este negocio?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deleteNegocio(id);
      
      if (response.ok) {
        await loadNegocios();
      } else {
        alert(response.message || 'Error al eliminar negocio');
      }
    } catch (error) {
      console.error('Error eliminando negocio:', error);
      alert('Error de conexión al eliminar negocio');
    } finally {
      setDeletingId(undefined);
    }
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    loadNegocios();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Negocios"
          subtitle="Error al cargar datos"
          actions={[
            {
              label: "Reintentar",
              onClick: () => loadNegocios(),
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
        title="Negocios"
        subtitle={`Gestiona y administra todos los negocios del sistema`}
        breadcrumbs={[
          { label: "Inicio", onClick: () => navigate('/') },
          { label: "Negocios" }
        ]}
        actions={[
          {
            label: "Nuevo Negocio",
            onClick: handleCreateNew,
            variant: "default",
            icon: "🏢"
          }
        ]}
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
      </div>

      {/* Búsqueda y filtros */}
      <ActionCard
        title="Búsqueda y Filtros"
        subtitle="Encuentra negocios rápidamente"
        actions={[]}
      >
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre del negocio..."
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
            onClick={() => loadNegocios()}
            loading={loading}
            variant="secondary"
            className="btn-secondary"
          >
            🔄 Actualizar
          </LoadingButton>
        </div>
      </ActionCard>

      {/* Tabla de negocios */}
      <div className="space-y-4">
        {searching && (
          <div className="text-center py-4">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-secondary">Buscando negocios...</p>
          </div>
        )}
        
        <NegociosTable
          negocios={negocios}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          deletingId={deletingId}
        />
      </div>

      {/* Modal */}
      <NegocioModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitNegocio}
        negocio={selectedNegocio}
        loading={modalLoading}
        mode={modalMode}
      />
    </div>
  );
};

export default Negocios;