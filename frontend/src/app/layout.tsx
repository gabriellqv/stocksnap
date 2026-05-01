import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StockSnap - Controle de Estoque',
  description: 'Sistema de controle de estoque para pequenos comércios',
};

/**
 * @description Layout raiz da aplicação Next.js.
 * Configura as fontes Inter (interface) e JetBrains Mono (dados técnicos)
 * via `next/font`, injeta as CSS variables no elemento `<html>` e aplica
 * a paleta dark premium como padrão global.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-foreground antialiased font-sans">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
