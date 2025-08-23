import React from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary' | 'accent';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  variant = 'default',
  size = 'default',
  children,
  loadingText,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        loading && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <div className="loading-spinner mr-2" />
      )}
      {loading ? (loadingText || children) : children}
    </Button>
  );
};