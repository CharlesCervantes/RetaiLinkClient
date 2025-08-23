import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { LoadingButton } from './loading-button';
import { cn } from '../../lib/utils';

interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  loadingText?: string;
}

interface ActionCardProps {
  title: string;
  subtitle?: string;
  actions: ActionItem[];
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  actions,
  className,
  layout = 'horizontal'
}) => {
  const getLayoutClass = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-3';
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-3';
      default:
        return 'flex flex-wrap gap-3';
    }
  };

  return (
    <Card className={cn('custom-card fade-in', className)}>
      <CardHeader>
        <CardTitle className="text-primary">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-secondary text-sm font-normal mt-1">{subtitle}</p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={getLayoutClass()}>
          {actions.map((action, index) => (
            <LoadingButton
              key={index}
              variant={action.variant || 'secondary'}
              onClick={action.onClick}
              loading={action.loading}
              disabled={action.disabled}
              loadingText={action.loadingText}
              className="interactive"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </LoadingButton>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};