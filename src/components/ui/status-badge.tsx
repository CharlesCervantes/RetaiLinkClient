import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'error' | 'info';
  text?: string;
  className?: string;
}

const statusConfig = {
  active: {
    text: 'Activo',
    className: 'badge badge-success'
  },
  inactive: {
    text: 'Inactivo',
    className: 'badge badge-error'
  },
  pending: {
    text: 'Pendiente',
    className: 'badge badge-warning'
  },
  success: {
    text: 'Exitoso',
    className: 'badge badge-success'
  },
  warning: {
    text: 'Advertencia',
    className: 'badge badge-warning'
  },
  error: {
    text: 'Error',
    className: 'badge badge-error'
  },
  info: {
    text: 'Información',
    className: 'badge badge-info'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  className
}) => {
  const config = statusConfig[status];
  const displayText = text || config.text;

  return (
    <span className={cn(config.className, className)}>
      {displayText}
    </span>
  );
};