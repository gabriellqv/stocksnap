import { cn, formatCurrency } from './utils';

describe('Utils', () => {
  describe('cn()', () => {
    it('deve remover conflitos de utilitários do Tailwind', () => {
      // "p-4" (padding em tudo) sobrescreve o "px-2 py-1" original
      const result = cn('px-2 py-1', 'p-4');
      expect(result).toBe('p-4');
    });

    it('deve suportar classes condicionais complexas usando clsx', () => {
      const isError = true;
      const isSuccess = false;
      const result = cn(
        'base-class',
        isError && 'bg-red-500 text-white',
        isSuccess && 'bg-green-500',
      );
      expect(result).toBe('base-class bg-red-500 text-white');
    });
  });

  describe('formatCurrency()', () => {
    it('deve formatar números para BRL corretamente', () => {
      // BRL formata milhar com ponto e decimal com vírgula
      // O regex com \xa0 lida com non-breaking spaces que a API Intl geralmente injeta
      expect(formatCurrency(1500.5)).toMatch(/R\$\s?1\.500,50/);
    });

    it('deve formatar valor zerado', () => {
      expect(formatCurrency(0)).toMatch(/R\$\s?0,00/);
    });

    it('deve ignorar centavos desnecessários e arrendondar apropriadamente se precisão for extendida', () => {
      expect(formatCurrency(10.129)).toMatch(/R\$\s?10,13/);
    });
  });
});
