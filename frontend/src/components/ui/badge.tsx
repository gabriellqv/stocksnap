import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * @description Propriedades aceitas pelo componente Badge.
 * Estende os atributos nativos de `<div>` com suporte a variantes visuais.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

/**
 * @description Mapeamento de estilos por variante visual do badge.
 */
const variantStyles = {
  default: 'border-transparent bg-accent text-white',
  secondary: 'border-transparent bg-surface text-foreground',
  destructive: 'border-transparent bg-destructive-muted text-destructive',
  outline: 'border-border text-foreground',
};

/**
 * @description Componente de etiqueta visual compacta do design system StockSnap.
 * Utilizado para exibir status, categorias ou contagens em formato inline.
 *
 * @param {BadgeProps} props - Propriedades do componente incluindo variante visual.
 * @returns {React.ReactElement} Elemento `<div>` estilizado como badge.
 *
 * @example
 * <Badge variant="destructive">Estoque Baixo</Badge>
 */
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
