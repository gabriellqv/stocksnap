import * as React from 'react';

/**
 * @description Logotipo minimalista oficial do StockSnap.
 * Formado por prismas geométricos em projeção isométrica que desenham
 * a silhueta da letra "S" e uma caixa de estoque através de espaço negativo.
 * Totalmente vetorizado em SVG com transparência pura e sem fundo preto.
 */
export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 600 678"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient
          id="ss-logo-grad-top"
          x1="298"
          y1="21"
          x2="400"
          y2="424"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id="ss-logo-grad-bottom"
          x1="300"
          y1="244"
          x2="301"
          y2="657"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      {/* Braço Superior do S Isométrico */}
      <path
        d="M298 21 L553 167 L452 227 L299 139 L121 244 L399 424 L301 485 L21 304 L22 182 Z"
        fill="url(#ss-logo-grad-top)"
      />

      {/* Braço Inferior do S Isométrico */}
      <path
        d="M298 184 L577 364 L576 491 L301 657 L21 488 L22 360 L299 538 L480 426 L200 244 Z"
        fill="url(#ss-logo-grad-bottom)"
      />

      {/* Faceta Acento Superior Direito */}
      <path
        d="M576 189 L578 309 L480 246 Z"
        fill="#3b82f6"
        fillOpacity="0.95"
      />
    </svg>
  );
}
