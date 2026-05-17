import * as React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="stocksnap-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0b317a" />
        </linearGradient>
      </defs>
      <path d="M16 2 L30 9 V23 L16 30 L2 23 V9 Z" fill="url(#stocksnap-gradient)" />
      <path d="M16 2 L30 9 L16 16 L2 9 Z" fill="rgba(255,255,255,0.3)" />
      <path d="M2 9 L16 16 V30 L2 23 Z" fill="rgba(255,255,255,0.1)" />
      <path d="M16 10 L22 13.5 V20.5 L16 24 L10 20.5 V13.5 Z" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}
