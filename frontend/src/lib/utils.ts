import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

/**
 * @description Constrói uma query string a partir de um objeto de parâmetros.
 * Filtra automaticamente valores falsy (null, undefined, string vazia).
 * Utiliza URLSearchParams para escape correto de caracteres especiais.
 *
 * @param {Record<string, string | number | undefined>} params - Pares chave-valor dos filtros.
 * @returns {string} Query string formatada (ex: `?search=shampoo&page=2`) ou string vazia.
 */
export function buildQueryString(
  params: Record<string, string | number | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}
