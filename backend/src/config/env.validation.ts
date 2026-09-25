/**
 * @description Validação das variáveis de ambiente na inicialização da aplicação.
 *
 * Falhar rápido (fail-fast) no boot é preferível a rodar com configuração insegura:
 * um `JWT_SECRET` ausente, curto ou igual a um placeholder conhecido permite que
 * qualquer pessoa forje tokens válidos e assuma a identidade de um ADMIN.
 *
 * A validação é injetada no `ConfigModule.forRoot({ validate })`, então o processo
 * é encerrado com uma mensagem clara antes de aceitar qualquer requisição.
 */

/** Comprimento mínimo aceitável para o segredo HMAC do JWT. */
const MIN_JWT_SECRET_LENGTH = 32;

/** Placeholders que aparecem nos arquivos de exemplo e nunca devem ir a produção. */
const FORBIDDEN_JWT_SECRETS = [
  'sua-chave-secreta-aqui-troque-em-producao',
  'troque-por-uma-chave-secreta-forte-em-producao',
  'super-secret-key-change-in-production',
  'secret',
  'changeme',
  'jwt-secret',
];

/**
 * @description Valida o conjunto de variáveis de ambiente carregadas pelo ConfigModule.
 *
 * @param {Record<string, unknown>} config - Variáveis de ambiente já resolvidas.
 * @returns {Record<string, unknown>} O mesmo objeto, quando válido.
 * @throws {Error} Se `JWT_SECRET` estiver ausente, curto ou for um placeholder conhecido.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const jwtSecret = config.JWT_SECRET;

  if (typeof jwtSecret !== 'string' || jwtSecret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET é obrigatório. Defina uma chave aleatória com ao menos ' +
        `${MIN_JWT_SECRET_LENGTH} caracteres.`,
    );
  }

  if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET deve ter ao menos ${MIN_JWT_SECRET_LENGTH} caracteres ` +
        `(atual: ${jwtSecret.length}).`,
    );
  }

  if (FORBIDDEN_JWT_SECRETS.includes(jwtSecret.trim().toLowerCase())) {
    throw new Error(
      'JWT_SECRET usa um valor de exemplo conhecido. Gere uma chave aleatória, ' +
        "ex.: `node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"`.",
    );
  }

  return config;
}
