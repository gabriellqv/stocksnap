/**
 * @description Página principal do dashboard (rota `/`).
 * Exibe o resumo geral do sistema com métricas de estoque.
 * Será expandida com cards de KPIs, gráficos e tabela de itens críticos.
 */
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        Dashboard
      </h1>
      <p className="text-muted">
        Bem-vindo ao StockSnap. Resumo do sistema em breve.
      </p>
    </div>
  );
}
