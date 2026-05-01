import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * @description Alias de tipo para as propriedades nativas de `<input>`.
 * Permite extensão futura sem modificar a interface do componente.
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * @description Componente de input reutilizável do design system StockSnap.
 * Aplica estilização consistente com a paleta dark premium, incluindo
 * transições de foco, borda accent e suporte a estados disabled.
 *
 * @param {InputProps} props - Propriedades nativas do elemento `<input>`.
 * @returns {React.ReactElement} Elemento `<input>` estilizado.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
