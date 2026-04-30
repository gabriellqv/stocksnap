/**
 * @description Página inicial do StockSnap.
 *
 * Redireciona o usuário para a tela de login ou para o dashboard,
 * dependendo do estado de autenticação. Enquanto os módulos de
 * autenticação e roteamento não estão implementados, exibe uma
 * tela de placeholder com a identidade visual do projeto.
 *
 * @returns {JSX.Element} Tela inicial com branding do StockSnap.
 */
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            StockSnap
          </h1>
        </div>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Sistema de gestão de estoque com controle de produtos, movimentações e
          dashboard analítico.
        </p>
        <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-500">
          <span>NestJS</span>
          <span>·</span>
          <span>Next.js</span>
          <span>·</span>
          <span>PostgreSQL</span>
          <span>·</span>
          <span>Redis</span>
        </div>
      </main>
    </div>
  );
}
