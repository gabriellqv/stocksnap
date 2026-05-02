'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowLeftRight,
  Activity,
  Plus,
  Bell,
  Trophy,
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDashboardStore } from '@/stores/dashboard-store';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MovementModal } from '@/components/movement-modal';
import { ProductModal } from '@/components/product-modal';
import { useProductStore } from '@/stores/product-store';
import { useIsAdmin } from '@/hooks/use-is-admin';

/**
 * @description Página principal do Dashboard (rota `/`).
 * Orquestra e apresenta o resumo do negócio utilizando o Recharts para visualização gráfica.
 * Contém KPIs financeiros, volumetria diária, ações rápidas, alertas de estoque e o
 * destaque do produto mais movimentado. Ações de criação de produto são restritas
 * ao perfil ADMIN via controle de acesso baseado em papéis (RBAC).
 */
export default function DashboardPage() {
  const { summary, chart, lowStock, isLoading, error, fetchDashboardData } =
    useDashboardStore();
  const { fetchProducts } = useProductStore();

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const isAdmin = useIsAdmin();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleActionComplete = () => {
    /** Assegura a revalidação dos dados do painel após o fechamento de um modal de mutação */
    fetchDashboardData();
    fetchProducts();
  };

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted gap-4">
        <Activity className="w-8 h-8 animate-pulse text-accent" />
        <p>Carregando métricas em tempo real...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-status-critical-bg/10 border border-status-critical-text/30 rounded-xl text-status-critical-text">
        <h3 className="font-bold flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          Erro ao carregar Dashboard
        </h3>
        <p>{error}</p>
      </div>
    );
  }

  /**
   * Calcula a tendência (Delta) de movimentações de forma segura.
   * Evita divisão por zero ou retornos NaN durante a invalidação de cache do Redis.
   */
  const yMov = summary.yesterdayMovements || 0;
  const tMov = summary.todayMovements || 0;
  const movementDiff = tMov - yMov;
  const movementDelta =
    yMov === 0 ? (tMov > 0 ? 100 : 0) : Math.round((movementDiff / yMov) * 100);

  /** Agrega o volume financeiro diário para composição do gráfico misto (área/linha) */
  const chartDataWithVolume = chart.map((c) => ({
    ...c,
    volume: c.entries + c.exits,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            {summary.criticalItems > 0 && (
              <div
                className="relative flex h-3 w-3 mt-1"
                title={`${summary.criticalItems} itens críticos`}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical-text opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-status-critical-text"></span>
              </div>
            )}
          </div>
          <p className="text-muted mt-1">
            Visão geral do seu negócio e status do inventário
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsMovementModalOpen(true)}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Movimentar
          </Button>
          {isAdmin && (
            <Button
              className="gap-2"
              onClick={() => setIsProductModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      {/* KPIs / Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-accent/50 transition-colors relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted">
              Total de Produtos
            </CardTitle>
            <Package className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">
              {summary.totalProducts}
            </div>
            <p className="text-xs text-muted mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:border-status-ok-text/50 transition-colors relative overflow-hidden group">
          <div className="absolute inset-0 bg-status-ok-text/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted">
              Valor em Estoque
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-status-ok-text" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(summary.totalValue)}
            </div>
            <p className="text-xs text-muted mt-1">Baseado no preço de venda</p>
          </CardContent>
        </Card>

        <Card className="hover:border-status-critical-text/50 transition-colors relative overflow-hidden group">
          <div className="absolute inset-0 bg-status-critical-text/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted flex items-center gap-2">
              Estoque Crítico
            </CardTitle>
            <Bell
              className={`w-5 h-5 ${summary.criticalItems > 0 ? 'text-status-critical-text animate-pulse' : 'text-muted'}`}
            />
          </CardHeader>
          <CardContent className="relative z-10">
            <div
              className={`text-3xl font-bold ${summary.criticalItems > 0 ? 'text-status-critical-text' : 'text-foreground'}`}
            >
              {summary.criticalItems}
            </div>
            <p className="text-xs text-muted mt-1">Abaixo ou igual ao mínimo</p>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-hover/50 transition-colors relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent-hover/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted">
              Movimentações Hoje
            </CardTitle>
            <Activity className="w-5 h-5 text-accent-hover" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-foreground">
                {summary.todayMovements}
              </div>
              <Badge
                variant={movementDelta >= 0 ? 'default' : 'destructive'}
                className={`text-[10px] px-1.5 py-0 ${movementDelta >= 0 ? 'bg-status-ok-bg text-status-ok-text' : ''}`}
              >
                {movementDelta > 0 ? '+' : ''}
                {movementDelta}%
              </Badge>
            </div>
            <p className="text-xs text-muted mt-1">Vs. ontem ({yMov})</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Gráfico Misto (Composed) */}
        <Card className="col-span-1 lg:col-span-5">
          <CardHeader>
            <CardTitle>
              Volume de Caixa vs. Entradas e Saídas (7 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 lg:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartDataWithVolume}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#333"
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const [, month, day] = value.split('-');
                      return `${day}/${month}`;
                    }}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#333', opacity: 0.2 }}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      borderColor: '#333',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar
                    dataKey="entries"
                    name="Entradas"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="exits"
                    name="Saídas"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volume Total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {/* Campeão de Vendas (Top Product) */}
          <Card className="border-accent/30 bg-gradient-to-br from-surface to-accent-muted/10 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <Trophy className="w-4 h-4 text-status-warning-text" />
                Destaque da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.topProduct ? (
                <div>
                  <p
                    className="text-xl font-bold text-foreground leading-tight truncate"
                    title={summary.topProduct.name}
                  >
                    {summary.topProduct.name}
                  </p>
                  <p className="text-sm text-status-warning-text font-medium mt-1">
                    {summary.topProduct.quantity} unidades saíram
                  </p>
                </div>
              ) : (
                <div className="text-muted text-sm mt-2">
                  Nenhuma saída registrada.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Produtos Críticos */}
          <Card className="flex-1 overflow-hidden flex flex-col min-h-[250px]">
            <CardHeader className="bg-status-critical-bg/5 border-b border-border py-4">
              <CardTitle className="text-status-critical-text flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Alerta de Reposição
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted">
                  <Package className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">Estoque saudável!</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {lowStock.slice(0, 4).map((item) => (
                    <li
                      key={item.id}
                      className="p-3 hover:bg-surface transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-muted font-mono">
                          {item.sku}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <Badge
                          variant="destructive"
                          className="font-mono text-[10px] px-1.5 py-0"
                        >
                          {item.quantity} / {item.minQuantity}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          handleActionComplete();
        }}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          handleActionComplete();
        }}
      />
    </div>
  );
}
