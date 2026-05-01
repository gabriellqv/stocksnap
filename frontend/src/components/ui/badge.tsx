import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantStyles = {
  default: 'border-transparent bg-accent text-white',
  secondary: 'border-transparent bg-surface text-foreground',
  destructive: 'border-transparent bg-destructive-muted text-destructive',
  outline: 'border-border text-foreground',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
