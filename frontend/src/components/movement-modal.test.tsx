import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovementModal } from './movement-modal';
import { useMovementStore } from '@/stores/movement-store';
import { useProductStore } from '@/stores/product-store';
import { toast } from 'sonner';

// Mock Zustand stores and sonner
jest.mock('@/stores/movement-store');
jest.mock('@/stores/product-store');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MovementModal Component', () => {
  const mockCreateMovement = jest.fn();
  const mockFetchProducts = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useMovementStore as unknown as jest.Mock).mockReturnValue({
      createMovement: mockCreateMovement,
      isLoading: false,
    });

    (useProductStore as unknown as jest.Mock).mockReturnValue({
      products: [{ id: 'prod-1', name: 'Shampoo', sku: 'SH-01' }],
      fetchProducts: mockFetchProducts,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('não deve renderizar quando isOpen for false', () => {
    const { container } = render(
      <MovementModal isOpen={false} onClose={mockOnClose} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('deve exibir erro se tentar submeter sem selecionar um produto', async () => {
    render(<MovementModal isOpen={true} onClose={mockOnClose} />);

    const submitBtn = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Selecione um produto.'),
    ).toBeInTheDocument();
    expect(mockCreateMovement).not.toHaveBeenCalled();
  });

  it('deve exibir erro se a quantidade for vazia ou zero', async () => {
    render(<MovementModal isOpen={true} onClose={mockOnClose} />);

    // Seleciona produto
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'prod-1' } });

    const submitBtn = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('A quantidade deve ser maior que zero.'),
    ).toBeInTheDocument();
    expect(mockCreateMovement).not.toHaveBeenCalled();
  });

  it('deve chamar createMovement com sucesso e fechar o modal', async () => {
    render(<MovementModal isOpen={true} onClose={mockOnClose} />);

    // Seleciona produto
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'prod-1' },
    });

    // Preenche quantidade
    const qtyInput = screen.getByPlaceholderText(/Ex: 10/i);
    fireEvent.change(qtyInput, { target: { value: '5' } });

    // Clica no botão de SAÍDA
    const exitBtn = screen.getByRole('button', { name: /saída/i });
    fireEvent.click(exitBtn);

    // Confirma form
    const submitBtn = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMovement).toHaveBeenCalledWith({
        type: 'EXIT',
        productId: 'prod-1',
        quantity: 5,
        reason: undefined,
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Saída registrada com sucesso!');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
