import React from 'react';

import { EstablecimientosAdministradoresClients } from './EstablecimientosAdministradoresClients'
import { EstablecimientosSuperAdmin } from './EstablecimientosSuperAdmin'

import { useAuthStore } from '../../store/authStore';

const Establecimientos: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        { (user?.i_rol === 1) && (
          <>
            <EstablecimientosSuperAdmin />
          </>
        )}

        { (user?.i_rol === 2) && (
          <>
            <EstablecimientosAdministradoresClients />
          </>
        )}
        
      </div>
    </div>
  );
};

export default Establecimientos;