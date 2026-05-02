import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renderiza os componentes nativos button com texto corretamente', () => {
    render(<Button>Salvar</Button>);
    const button = screen.getByRole('button', { name: /salvar/i });
    expect(button).toBeInTheDocument();
  });

  it('aplica as classes de variante do design system apropriadamente', () => {
    render(<Button variant="destructive">Excluir</Button>);
    const button = screen.getByRole('button');
    // Verifica se a classe CSS do token de erro do Tailwind está presente
    expect(button).toHaveClass('bg-destructive');
    expect(button).toHaveClass('text-accent-foreground');
  });

  it('aplica classes de tamanho customizadas', () => {
    render(<Button size="lg">Grande</Button>);
    const button = screen.getByRole('button');
    // Verifica height 11 (h-11) para botoes grandes
    expect(button).toHaveClass('h-11');
  });

  it('chama onClick quando clicado e gerencia interatividade', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Ação</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('não deve disparar eventos de click quando estiver na flag disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Desabilitado
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    // Confirma que a opacidade sofreu mutação no design
    expect(button).toHaveClass('disabled:opacity-50');
  });
});
