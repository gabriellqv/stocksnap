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

/**
 * @description Helper de resposta paginada da API. O store percorre as páginas
 * até esgotá-las, então os mocks precisam refletir o contrato `{ data, meta }`.
 */
function paginated<T>(data: T[], totalPages = 1) {
  return {
    data,
    meta: { total: data.length, page: 1, limit: 100, totalPages },
  };
}

describe('CategoryStore', () => {
  beforeEach(() => {
    useCategoryStore.setState({
      categories: [],
      isLoading: false,
      isSubmitting: false,
    });
    jest.clearAllMocks();
  });

  it('deve buscar categorias e atualizar o estado', async () => {
    const mockCategories = [
      { id: '1', name: 'Cat 1' },
      { id: '2', name: 'Cat 2' },
    ];
    (api.get as jest.Mock).mockResolvedValue(paginated(mockCategories));

    const { fetchCategories } = useCategoryStore.getState();
    await fetchCategories();

    const state = useCategoryStore.getState();
    expect(api.get).toHaveBeenCalledWith('/categories?limit=100&page=1');
    expect(state.categories).toEqual(mockCategories);
    expect(state.isLoading).toBe(false);
  });

  it('deve percorrer múltiplas páginas até esgotar os resultados', async () => {
    (api.get as jest.Mock)
      .mockResolvedValueOnce(paginated([{ id: '1', name: 'Cat 1' }], 2))
      .mockResolvedValueOnce(paginated([{ id: '2', name: 'Cat 2' }], 2));

    const { fetchCategories } = useCategoryStore.getState();
    await fetchCategories();

    expect(api.get).toHaveBeenNthCalledWith(1, '/categories?limit=100&page=1');
    expect(api.get).toHaveBeenNthCalledWith(2, '/categories?limit=100&page=2');
    expect(useCategoryStore.getState().categories).toHaveLength(2);
  });

  it('deve criar categoria e recarregar a lista', async () => {
    const mockNewCat = { id: '3', name: 'Cat 3' };
    (api.post as jest.Mock).mockResolvedValue(mockNewCat);
    (api.get as jest.Mock).mockResolvedValue(paginated([mockNewCat]));

    const { createCategory } = useCategoryStore.getState();
    const result = await createCategory({ name: 'Cat 3' });

    expect(api.post).toHaveBeenCalledWith('/categories', { name: 'Cat 3' });
    expect(api.get).toHaveBeenCalledWith('/categories?limit=100&page=1');
    expect(result).toEqual(mockNewCat);

    const state = useCategoryStore.getState();
    expect(state.categories).toEqual([mockNewCat]);
    expect(state.isSubmitting).toBe(false);
  });

  it('deve atualizar categoria e recarregar a lista', async () => {
    (api.patch as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Cat 1 Editada',
    });
    (api.get as jest.Mock).mockResolvedValue(
      paginated([{ id: '1', name: 'Cat 1 Editada' }]),
    );

    const { updateCategory } = useCategoryStore.getState();
    await updateCategory('1', { name: 'Cat 1 Editada' });

    expect(api.patch).toHaveBeenCalledWith('/categories/1', {
      name: 'Cat 1 Editada',
    });
    expect(api.get).toHaveBeenCalledWith('/categories?limit=100&page=1');
  });

  it('deve deletar categoria e recarregar a lista', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ id: '1' });
    (api.get as jest.Mock).mockResolvedValue(paginated([]));

    const { deleteCategory } = useCategoryStore.getState();
    await deleteCategory('1');

    expect(api.delete).toHaveBeenCalledWith('/categories/1');
    expect(api.get).toHaveBeenCalledWith('/categories?limit=100&page=1');
  });
});
