'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  id?: string;
  name?: string;
}

/**
 * @description Componente de Select customizado e estilizado conforme o design system StockSnap.
 * Substitui o select nativo do navegador por um dropdown elegante com suporte a dark/light mode,
 * transições fluidas, ícone de checagem e fechamento inteligente ao clicar fora ou pressionar Escape.
 */
export function Select({
  value = '',
  onChange,
  options,
  placeholder = 'Selecione...',
  disabled = false,
  className,
  error = false,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Tecla Escape para fechar
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (disabled) return;
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Elemento select acessível oculto para compatibilidade com leitores de tela e testes */}
      <select
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="sr-only pointer-events-none absolute opacity-0 -z-10 h-0 w-0"
        id={id ? `${id}-native` : undefined}
        name={name}
      >
        {options.map((opt) => (
          <option key={opt.value || '__empty__'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border bg-surface px-3 py-2 text-sm text-foreground transition-all duration-200 cursor-pointer select-none',
          'hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent',
          error ? 'border-destructive focus-visible:ring-destructive/30' : 'border-border',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          isOpen && 'border-accent ring-2 ring-accent/30',
        )}
      >
        <span
          className={cn(
            'truncate',
            !selectedOption || selectedOption.value === ''
              ? 'text-muted'
              : 'text-foreground font-medium',
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'rotate-180 text-foreground',
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {options.length === 0 ? (
            <div className="py-2.5 px-3 text-xs text-muted text-center">
              Nenhuma opção disponível
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value || '__empty__'}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors duration-150 select-none',
                    isSelected
                      ? 'bg-accent text-accent-foreground font-medium shadow-sm'
                      : 'text-foreground hover:bg-border/50 hover:text-foreground',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-accent-foreground shrink-0 ml-2 animate-in fade-in zoom-in-75 duration-100" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
