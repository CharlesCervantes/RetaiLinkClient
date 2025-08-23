import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { StatusBadge } from './status-badge';
import { LoadingButton } from './loading-button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { cn } from '../../lib/utils';
import { Usuario } from '../../Fetch/usuarios';

interface UserListProps {
  users: Usuario[];
  title: string;
  loading?: boolean;
  onCreateUser?: () => void;
  creatingUser?: boolean;
  renderUserActions?: (user: Usuario) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  showCreateButton?: boolean;
  createUserModal?: React.ReactNode;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  title,
  loading = false,
  onCreateUser,
  creatingUser = false,
  renderUserActions,
  className,
  emptyMessage = 'No hay usuarios registrados.',
  showCreateButton = true,
  createUserModal
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

  return (
    <Card className={cn('custom-card fade-in', className)}>
      <CardHeader>
        <CardTitle className="text-primary flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          {showCreateButton && onCreateUser && (
            <>
              {createUserModal ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <LoadingButton
                      variant="default"
                      loading={creatingUser}
                      loadingText="Creando..."
                      className="btn-primary"
                    >
                      Crear Usuario
                    </LoadingButton>
                  </DialogTrigger>
                  {createUserModal}
                </Dialog>
              ) : (
                <LoadingButton
                  variant="default"
                  onClick={onCreateUser}
                  loading={creatingUser}
                  loadingText="Creando..."
                  className="btn-primary"
                >
                  Crear Usuario
                </LoadingButton>
              )}
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary text-lg mb-2">👤</div>
            <p className="text-secondary">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div
                key={user.id_usuario || index}
                className="border border-primary rounded-lg p-4 hover:shadow-md transition-shadow slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Nombre
                    </label>
                    <p className="text-primary font-medium">
                      {user.vc_nombre || 'No disponible'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Usuario
                    </label>
                    <p className="text-primary">
                      {user.vc_username || 'No disponible'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-secondary">
                      Estado
                    </label>
                    <div>
                      <StatusBadge
                        status={user.b_activo !== false ? 'active' : 'inactive'}
                      />
                    </div>
                  </div>
                  
                  {renderUserActions && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-secondary">
                        Acciones
                      </label>
                      <div className="flex gap-2">
                        {renderUserActions(user)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};