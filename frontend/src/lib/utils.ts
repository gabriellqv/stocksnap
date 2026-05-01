/**
 * @description Formata um valor numérico como moeda brasileira (R$).
 *
 * @param {number} value - O valor a ser formatado.
 * @returns {string} Valor formatado, ex: `R$ 1.234,56`.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * @description Formata uma string de data ISO para o padrão brasileiro
 * com data e hora: `DD/MM/AAAA HH:MM`.
 *
 * @param {string} dateString - String de data no formato ISO 8601.
 * @returns {string} Data formatada no padrão pt-BR.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @description Combina classes CSS condicionalmente e resolve conflitos do Tailwind.
 * Utiliza `clsx` para classes condicionais e `tailwind-merge` para garantir
 * a especificidade correta (a última classe inserida vence).
 *
 * @param {...ClassValue[]} inputs - Classes CSS a combinar.
 * @returns {string} String com as classes mescladas e sem conflitos.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
