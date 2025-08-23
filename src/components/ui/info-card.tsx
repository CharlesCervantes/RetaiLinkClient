import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

interface InfoItem {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface InfoCardProps {
  title: string;
  subtitle?: string;
  items: InfoItem[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  items,
  className,
  columns = 2,
  loading = false
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  if (loading) {
    return (
      <Card className={cn('custom-card fade-in', className)}>
        <CardHeader>
          <div className="loading-skeleton h-6 w-48 mb-2"></div>
          {subtitle && <div className="loading-skeleton h-4 w-32"></div>}
        </CardHeader>
        <CardContent>
          <div className={cn('grid gap-4', gridCols[columns])}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="loading-skeleton h-4 w-24"></div>
                <div className="loading-skeleton h-5 w-32"></div>
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
        <CardTitle className="text-primary flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-secondary text-sm font-normal mt-1">{subtitle}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-4', gridCols[columns])}>
          {items.map((item, index) => (
            <div key={index} className={cn('space-y-1', item.className)}>
              <label className="text-sm font-medium text-secondary">
                {item.label}
              </label>
              <div className="text-primary font-medium">
                {item.value || (
                  <span className="text-secondary italic">No disponible</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};