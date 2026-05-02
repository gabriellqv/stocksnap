/**
 * @description Representação do usuário retornada ao frontend após login ou registro.
 * Exclui intencionalmente campos sensíveis como `password` e metadados internos
 * como `updatedAt`, garantindo que o contrato de API exponha apenas dados seguros.
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * @description Contrato de resposta para o endpoint `POST /auth/register`.
 * Retorna os dados públicos do usuário recém-criado com o timestamp de criação.
 */
export interface RegisterResponse extends UserResponse {
  createdAt: Date;
}

/**
 * @description Contrato de resposta para o endpoint `POST /auth/login`.
 * Inclui o token JWT de acesso e os dados básicos do usuário autenticado.
 */
export interface LoginResponse {
  access_token: string;
  user: UserResponse;
}
