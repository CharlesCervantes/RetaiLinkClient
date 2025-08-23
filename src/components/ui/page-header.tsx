import React from 'react';
import { LoadingButton } from './loading-button';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ActionItem[];
  className?: string;
  loading?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
  loading = false
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-4 fade-in', className)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="loading-skeleton h-8 w-64"></div>
            {subtitle && <div className="loading-skeleton h-4 w-48"></div>}
          </div>
          <div className="flex gap-2">
            <div className="loading-skeleton h-10 w-24"></div>
            <div className="loading-skeleton h-10 w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 fade-in', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-secondary">/</span>
                )}
                {item.onClick || item.href ? (
                  <button
                    onClick={item.onClick}
                    className="text-accent hover:text-primary transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-secondary">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{title}</h1>
          {subtitle && (
            <p className="text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <LoadingButton
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                loading={action.loading}
                disabled={action.disabled}
                className="interactive"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </LoadingButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};