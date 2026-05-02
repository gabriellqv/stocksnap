import { render, screen } from '@testing-library/react';
import { StockBadge } from './stock-badge';

/**
 * @description Suite de testes unitários para o componente StockBadge.
 *
 * Valida a regra de cores e ícones baseada no estoque:
 * - Crítico: quantity <= minQuantity
 * - Atenção: quantity <= minQuantity * 2
 * - Normal: acima do dobro do mínimo
 */
describe('StockBadge', () => {
  it('deve mostrar status crítico quando estoque está abaixo ou igual ao mínimo', () => {
    render(<StockBadge quantity={5} minQuantity={5} />);

    const badge = screen.getByText('5 un.');
    expect(badge).toBeInTheDocument();
    // Verifica se tem a classe de erro (crítico)
    expect(badge).toHaveClass('text-status-critical-text');
  });

  it('deve mostrar status de atenção quando estoque está próximo do mínimo', () => {
    // minQuantity = 5, então até 10 é atenção
    render(<StockBadge quantity={8} minQuantity={5} />);

    const badge = screen.getByText('8 un.');
    expect(badge).toHaveClass('text-status-warning-text');
  });

  it('deve mostrar status normal quando estoque está saudável', () => {
    render(<StockBadge quantity={15} minQuantity={5} />);

    const badge = screen.getByText('15 un.');
    expect(badge).toHaveClass('text-status-ok-text');
  });

  it('deve mostrar ícone de alerta apenas no estado crítico', () => {
    const { rerender } = render(<StockBadge quantity={5} minQuantity={5} />);
    // No crítico deve ter um elemento svg (Lucide icon)
    expect(document.querySelector('svg')).toBeInTheDocument();

    rerender(<StockBadge quantity={15} minQuantity={5} />);
    // No normal não deve ter o ícone
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });
});
