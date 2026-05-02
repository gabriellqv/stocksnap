import { useCategoryStore } from './category-store';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('CategoryStore', () => {
  beforeEach(() => {
    useCategoryStore.setState({ categories: [], isLoading: false, isSubmitting: false });
    jest.clearAllMocks();
  });

  it('deve buscar categorias e atualizar o estado', async () => {
    const mockCategories = [{ id: '1', name: 'Cat 1' }, { id: '2', name: 'Cat 2' }];
    (api.get as jest.Mock).mockResolvedValue(mockCategories);

    const { fetchCategories } = useCategoryStore.getState();
    await fetchCategories();

    const state = useCategoryStore.getState();
    expect(api.get).toHaveBeenCalledWith('/categories');
    expect(state.categories).toEqual(mockCategories);
    expect(state.isLoading).toBe(false);
  });

  it('deve criar categoria e recarregar a lista', async () => {
    const mockNewCat = { id: '3', name: 'Cat 3' };
    (api.post as jest.Mock).mockResolvedValue(mockNewCat);
    (api.get as jest.Mock).mockResolvedValue([mockNewCat]); // Mock da recarga

    const { createCategory } = useCategoryStore.getState();
    const result = await createCategory({ name: 'Cat 3' });

    expect(api.post).toHaveBeenCalledWith('/categories', { name: 'Cat 3' });
    expect(api.get).toHaveBeenCalledWith('/categories'); // Garante que atualizou a lista
    expect(result).toEqual(mockNewCat);
    
    const state = useCategoryStore.getState();
    expect(state.categories).toEqual([mockNewCat]);
    expect(state.isSubmitting).toBe(false);
  });

  it('deve atualizar categoria e recarregar a lista', async () => {
    (api.patch as jest.Mock).mockResolvedValue({ id: '1', name: 'Cat 1 Editada' });
    (api.get as jest.Mock).mockResolvedValue([{ id: '1', name: 'Cat 1 Editada' }]);

    const { updateCategory } = useCategoryStore.getState();
    await updateCategory('1', { name: 'Cat 1 Editada' });

    expect(api.patch).toHaveBeenCalledWith('/categories/1', { name: 'Cat 1 Editada' });
    expect(api.get).toHaveBeenCalledWith('/categories');
  });

  it('deve deletar categoria e recarregar a lista', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ id: '1' });
    (api.get as jest.Mock).mockResolvedValue([]);

    const { deleteCategory } = useCategoryStore.getState();
    await deleteCategory('1');

    expect(api.delete).toHaveBeenCalledWith('/categories/1');
    expect(api.get).toHaveBeenCalledWith('/categories');
  });
});
