import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * @description Propriedades aceitas pelo componente Button.
 * Estende os atributos nativos de `<button>` com suporte a variantes visuais
 * e tamanhos predefinidos do design system.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * @description Mapeamento de estilos por variante visual do botão.
 */
const variantStyles = {
  default: 'bg-accent text-accent-foreground hover:bg-accent-hover',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-surface hover:border-border-hover',
  ghost: 'bg-transparent text-muted hover:bg-surface hover:text-foreground',
  destructive: 'bg-destructive text-accent-foreground hover:bg-destructive/90',
};

/**
 * @description Mapeamento de estilos por tamanho do botão.
 */
const sizeStyles = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

/**
 * @description Componente de botão reutilizável do design system StockSnap.
 * Combina variantes visuais (default, outline, ghost, destructive) com
 * tamanhos predefinidos (default, sm, lg, icon), aplicando transições suaves
 * e suporte a focus ring para acessibilidade.
 *
 * @param {ButtonProps} props - Propriedades do componente incluindo variante e tamanho.
 * @returns {React.ReactElement} Elemento `<button>` estilizado.
 *
 * @example
 * <Button variant="outline" size="sm" onClick={handleClick}>
 *   Cancelar
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
