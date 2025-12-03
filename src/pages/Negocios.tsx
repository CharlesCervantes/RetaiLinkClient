import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/page-header';
import { NegociosTable } from '../components/ui/negocios-table';
import { NegocioModal } from '../components/ui/negocio-modal';
import { InfoCard } from '../components/ui/info-card';
import { Negocio, getAllNegocios, createNegocio, updateNegocio, deleteNegocio } from '../Fetch/negocios';
import { UsersIcon } from "lucide-react";

const Negocios: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deleteNegocio(id);
      
      if (response.ok) {
        await loadNegocios();
      } else {
        alert(response.message || 'Error al eliminar cliente');
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error de conexión al eliminar cliente');
    } finally {
      setDeletingId(undefined);
    }
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
        title="Clientes"
        subtitle={`Gestiona y administra todos los clientes del sistema`}
        breadcrumbs={[
          { label: "Inicio", onClick: () => navigate('/') },
          { label: "Clientes" }
        ]}
        actions={[
          {
            label: "Nuevo Cliente",
            onClick: handleCreateNew,
            variant: "default",
            icon: <UsersIcon />
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

      {/* Tabla de negocios */}
      <div className="space-y-4">
        
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