import { api, setAccessToken, ApiError } from './api';

describe('API Client Wrapper (api.ts)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    setAccessToken('mock-token-123');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deve injetar o token Bearer automaticamente em requisições autenticadas', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await api.get('/products');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/products'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token-123',
        }),
      }),
    );
  });

  it('não deve injetar o token Bearer se a flag skipAuth for true', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await api.post('/auth/login', { email: 'test' }, { skipAuth: true });

    const fetchArgs = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(fetchArgs.headers.Authorization).toBeUndefined();
  });

  it('deve serializar o payload no formato JSON apropriadamente', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patched: true }),
    });

    const payload = { quantity: 10 };
    await api.patch('/products/1', payload);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    );
  });

  it('deve lançar ApiError instanciado quando o backend retornar status HTTP de erro', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'A quantidade mínima é obrigatória' }),
    });

    await expect(api.post('/products', {})).rejects.toThrow(ApiError);
    await expect(api.post('/products', {})).rejects.toThrow(
      'A quantidade mínima é obrigatória',
    );
  });

  it('deve limpar o token da sessão local e disparar erro em caso de HTTP 401 (Sessão Expirada)', async () => {
    // Mock location href for JSDOM
    const originalLocation = window.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = { href: '' } as any;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ message: 'Token Invalido' }),
    });

    await expect(api.get('/protected-route')).rejects.toThrow(
      'Sessão expirada. Faça login novamente.',
    );

    // Restore location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = originalLocation as any;
  });
});
