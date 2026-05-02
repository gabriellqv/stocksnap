import { useAuthStore } from './auth-store';
import { api, setAccessToken } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
  setAccessToken: jest.fn(),
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset da store antes de cada teste
    useAuthStore.setState({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      isHydrated: false,
    });
    jest.clearAllMocks();
  });

  it('deve iniciar deslogado e sem token', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('deve realizar login com sucesso', async () => {
    const mockUser = {
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      role: 'ADMIN' as const,
    };
    const mockResponse = { access_token: 'fake-token', user: mockUser };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const { login } = useAuthStore.getState();
    await login({ email: 'test@test.com', password: 'password' });

    const state = useAuthStore.getState();
    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'test@test.com', password: 'password' },
      { skipAuth: true },
    );
    expect(setAccessToken).toHaveBeenCalledWith('fake-token');
    expect(state.user).toEqual(mockUser);
    expect(state.token).toEqual('fake-token');
    expect(state.error).toBeNull();
  });

  it('deve falhar no login e refletir o erro no estado', async () => {
    (api.post as jest.Mock).mockRejectedValue(
      new Error('Credenciais inválidas'),
    );

    const { login } = useAuthStore.getState();

    await expect(
      login({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow('Credenciais inválidas');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.error).toBe('Credenciais inválidas');
  });

  it('deve realizar logout corretamente limpando o estado', () => {
    // Força um estado logado inicial
    useAuthStore.setState({
      user: { id: '1', name: 'Test', email: 't@t.com', role: 'ADMIN' },
      token: 'token',
    });

    const { logout } = useAuthStore.getState();
    logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(setAccessToken).toHaveBeenCalledWith(null);
  });
});
