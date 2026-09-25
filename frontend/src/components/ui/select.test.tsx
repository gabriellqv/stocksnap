import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './select';

const mockOptions = [
  { value: '1', label: 'Alimentos' },
  { value: '2', label: 'Bebidas' },
];

describe('Select Component', () => {
  it('renderiza o placeholder quando nenhum valor é selecionado', () => {
    render(<Select options={mockOptions} placeholder="Selecione..." />);
    expect(screen.getByText('Selecione...')).toBeInTheDocument();
  });

  it('abre as opções ao clicar no botão do select', () => {
    render(<Select options={mockOptions} placeholder="Selecione..." />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const alimentosOptions = screen.getAllByRole('option', { name: 'Alimentos' });
    expect(alimentosOptions.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('option', { name: 'Bebidas' }).length).toBeGreaterThanOrEqual(1);
  });

  it('chama onChange com o valor selecionado ao clicar na opção', () => {
    const handleChange = jest.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Clica no item customizado do menu aberto
    const customOption = screen.getAllByRole('option', { name: 'Alimentos' })[1];
    fireEvent.click(customOption);

    expect(handleChange).toHaveBeenCalledWith('1');
  });
});
