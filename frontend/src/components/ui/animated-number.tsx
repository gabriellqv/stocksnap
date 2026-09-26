'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  /** Valor numérico final para onde o contador irá animar */
  value: number;
  /** Duração da animação em milissegundos (padrão: 1200ms) */
  duration?: number;
  /** Função de formatação customizada (ex: formatCurrency) */
  formatter?: (val: number) => string;
  /** Classes CSS adicionais */
  className?: string;
}

/**
 * Função de aceleração cúbica (easeOutCubic) para garantir
 * desaceleração suave e natural no final da contagem.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * @description Componente para animação crescente de números e valores monetários.
 * Utiliza `requestAnimationFrame` de alta precisão (60/120fps) com interpolação
 * contínua, partindo de zero no carregamento e animando até o valor de destino.
 */
export function AnimatedNumber({
  value,
  duration = 1200,
  formatter,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const targetValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    const startValue = prevValueRef.current;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startValue + (targetValue - startValue) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
        prevValueRef.current = targetValue;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = formatter
    ? formatter(displayValue)
    : Math.round(displayValue).toLocaleString('pt-BR');

  return <span className={className}>{formatted}</span>;
}
