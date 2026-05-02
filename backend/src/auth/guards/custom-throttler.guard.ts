import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * @description Guard global de rate limiting com mensagem personalizada em pt-BR.
 * Estende o ThrottlerGuard padrão do NestJS para sobrescrever a exceção
 * lançada ao exceder o limite de requisições, substituindo o texto genérico
 * "Too Many Requests" por uma mensagem amigável ao usuário final.
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * @description Sobrescreve o método de lançamento de exceção para exibir
   * uma mensagem de erro em português, alinhada com o idioma do frontend.
   * @throws {ThrottlerException} Sempre lança com a mensagem personalizada.
   */
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Muitas tentativas. Aguarde um momento antes de tentar novamente.',
    );
  }
}
