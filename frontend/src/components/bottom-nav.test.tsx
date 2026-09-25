import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from './bottom-nav';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('BottomNav Component', () => {
  it('renderiza os links de navegação principais', () => {
    const handleOpenMenu = jest.fn();
    render(<BottomNav onOpenMenu={handleOpenMenu} />);

    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Movimentar')).toBeInTheDocument();
    expect(screen.getByText('Categorias')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('destaca a aba ativa com base na rota atual', () => {
    const handleOpenMenu = jest.fn();
    render(<BottomNav onOpenMenu={handleOpenMenu} />);

    const inicioLink = screen.getByText('Início').closest('a');
    expect(inicioLink).toHaveClass('text-accent');
  });

  it('dispara o callback onOpenMenu ao clicar no botão Menu', () => {
    const handleOpenMenu = jest.fn();
    render(<BottomNav onOpenMenu={handleOpenMenu} />);

    const menuButton = screen.getByRole('button', { name: /abrir menu e configurações/i });
    fireEvent.click(menuButton);

    expect(handleOpenMenu).toHaveBeenCalledTimes(1);
  });
});
