import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

/** Fonte principal sans-serif utilizada em toda a interface do StockSnap. */
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

/** Fonte monoespaçada utilizada em tabelas de dados e elementos técnicos. */
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/** Metadata global do Next.js para SEO e compartilhamento social. */
export const metadata: Metadata = {
  title: 'StockSnap | Gestão de Estoque',
  description:
    'Sistema de gestão de estoque com controle de produtos, movimentações e dashboard analítico.',
};

/**
 * @description Layout raiz da aplicação StockSnap.
 *
 * Envolve todas as páginas do sistema, aplicando as fontes customizadas
 * (Geist Sans e Geist Mono) via CSS variables e configurando o elemento
 * `<html>` com anti-aliasing para melhor legibilidade tipográfica.
 *
 * @param {object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Página ativa renderizada pelo App Router.
 * @returns {JSX.Element} Estrutura HTML raiz com fontes e estilos globais aplicados.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
