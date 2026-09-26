/**
 * @description Claims fixas dos tokens JWT do StockSnap.
 *
 * Fixar `issuer` e `audience` e validá-los na estratégia adiciona defesa em
 * profundidade: um token assinado com o mesmo segredo para outro propósito
 * (ou outro emissor) não é aceito por esta API.
 */
export const JWT_ISSUER = 'stocksnap-api';
export const JWT_AUDIENCE = 'stocksnap-client';
