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
        <Toaster 
          position="top-right" 
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'w-full flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl bg-surface font-sans',
              title: 'text-sm font-medium text-foreground',
              description: 'text-sm text-muted',
              success: 'border-status-ok-text/30 text-status-ok-text',
              error: 'border-status-critical-text/30 text-status-critical-text',
              icon: 'w-5 h-5 flex-shrink-0',
            }
          }}
        />
      </body>
    </html>
  );
}
