/**
 * @fileoverview Página inicial do Dashboard com KPIs, gráficos e ações rápidas.
 */

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
  Area,
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
import { AnimatedNumber } from '@/components/ui/animated-number';
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

  if (error) {
    return (
      <div className="p-6 bg-status-critical-bg/10 border border-status-critical-text/30 rounded-xl text-status-critical-text flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h3 className="font-bold">Erro ao carregar Dashboard</h3>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => fetchDashboardData()}
          className="self-start px-4 py-2 bg-accent text-accent-contrast rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted gap-4">
        <Activity className="w-8 h-8 animate-pulse text-accent" />
        <p>Carregando métricas em tempo real...</p>
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
    <div className="flex-1 min-h-0 flex flex-col gap-3 lg:gap-4 2xl:gap-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            {summary.criticalItems > 0 && (
              <div
                className="relative flex h-2.5 w-2.5 2xl:h-3 2xl:w-3 mt-1"
                title={`${summary.criticalItems} itens críticos`}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical-text opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 2xl:h-3 2xl:w-3 bg-status-critical-text"></span>
              </div>
            )}
          </div>
          <p className="text-xs 2xl:text-sm text-muted mt-0.5">
            Visão geral do seu negócio e status do inventário
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="gap-2 h-8 lg:h-9 px-3 text-xs 2xl:text-sm"
            onClick={() => setIsMovementModalOpen(true)}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Movimentar
          </Button>
          {isAdmin && (
            <Button
              className="gap-2 h-8 lg:h-9 px-3 text-xs 2xl:text-sm"
              onClick={() => setIsProductModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      {/* KPIs / Cards */}
      <div className="shrink-0 grid gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total de Produtos */}
        <Card className="hover:border-accent/50 transition-colors relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-3.5 lg:pb-1">
            <CardTitle className="text-xs 2xl:text-sm font-medium text-muted">
              Total de Produtos
            </CardTitle>
            <Package className="w-4 h-4 2xl:w-5 2xl:h-5 text-accent" />
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-3.5 lg:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-foreground">
              <AnimatedNumber value={summary.totalProducts} />
            </div>
            <p className="text-[11px] 2xl:text-xs text-muted mt-0.5">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        {/* Valor em Estoque */}
        <Card className="hover:border-status-ok-text/50 transition-colors relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-3.5 lg:pb-1">
            <CardTitle className="text-xs 2xl:text-sm font-medium text-muted">
              Valor em Estoque
            </CardTitle>
            <TrendingUp className="w-4 h-4 2xl:w-5 2xl:h-5 text-status-ok-text" />
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-3.5 lg:pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-foreground">
              <AnimatedNumber value={summary.totalValue} formatter={formatCurrency} />
            </div>
            <p className="text-[11px] 2xl:text-xs text-muted mt-0.5">Baseado no preço de venda</p>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="hover:border-status-critical-text/50 transition-colors relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-3.5 lg:pb-1">
            <CardTitle className="text-xs 2xl:text-sm font-medium text-muted flex items-center gap-1.5">
              Estoque Crítico
            </CardTitle>
            <Bell
              className={`w-4 h-4 2xl:w-5 2xl:h-5 ${summary.criticalItems > 0 ? 'text-status-critical-text animate-pulse' : 'text-muted'}`}
            />
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-3.5 lg:pt-0">
            <div
              className={`text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold ${summary.criticalItems > 0 ? 'text-status-critical-text' : 'text-foreground'}`}
            >
              <AnimatedNumber value={summary.criticalItems} />
            </div>
            <p className="text-[11px] 2xl:text-xs text-muted mt-0.5">Abaixo ou igual ao mínimo</p>
          </CardContent>
        </Card>

        {/* Movimentações Hoje */}
        <Card className="hover:border-accent-hover/50 transition-colors relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 lg:p-3.5 lg:pb-1">
            <CardTitle className="text-xs 2xl:text-sm font-medium text-muted">
              Movimentações Hoje
            </CardTitle>
            <Activity className="w-4 h-4 2xl:w-5 2xl:h-5 text-accent-hover" />
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-3.5 lg:pt-0">
            <div className="flex items-baseline gap-2">
              <div className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-foreground">
                <AnimatedNumber value={summary.todayMovements} />
              </div>
              <Badge
                variant={movementDelta >= 0 ? 'default' : 'destructive'}
                className={`text-[10px] px-1.5 py-0 ${movementDelta >= 0 ? 'bg-status-ok-bg text-status-ok-text' : ''}`}
              >
                {movementDelta > 0 ? '+' : ''}
                {movementDelta}%
              </Badge>
            </div>
            <p className="text-[11px] 2xl:text-xs text-muted mt-0.5">Vs. ontem ({yMov})</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Inferior: Gráfico + Coluna Lateral com flex-1 min-h-0 */}
      <div className="grid gap-3 lg:gap-4 grid-cols-1 lg:grid-cols-7 flex-1 min-h-0">
        {/* Gráfico Misto (Composed) */}
        <Card className="col-span-1 lg:col-span-5 flex flex-col flex-1 min-h-0 overflow-hidden">
          <CardHeader className="p-3 pb-1 lg:p-3.5 lg:pb-1 shrink-0">
            <CardTitle className="text-xs sm:text-sm 2xl:text-base font-semibold">
              Volume de Caixa vs. Entradas e Saídas (7 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-2 lg:p-3 pt-0 lg:pt-0 w-full flex flex-col">
            <div className="w-full flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  key={`composed-chart-${chart.length}`}
                  data={chartDataWithVolume}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="volumeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#333"
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const [, month, day] = value.split('-');
                      return `${day}/${month}`;
                    }}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#333', opacity: 0.2 }}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      borderColor: '#333',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '6px', fontSize: '11px' }} />
                  {/* Barras de Entradas animadas crescendo do chão */}
                  <Bar
                    dataKey="entries"
                    name="Entradas"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={100}
                  />
                  {/* Barras de Saídas animadas com leve atraso para efeito cascata */}
                  <Bar
                    dataKey="exits"
                    name="Saídas"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1300}
                    animationEasing="ease-out"
                    animationBegin={250}
                  />
                  {/* Gradiente de preenchimento fluido sob a linha de volume */}
                  <Area
                    type="monotone"
                    dataKey="volume"
                    fill="url(#volumeAreaGradient)"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1600}
                    animationEasing="ease-out"
                    animationBegin={350}
                    legendType="none"
                  />
                  {/* Linha de Volume Total desenhada dinamicamente da esquerda para a direita */}
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volume Total"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#3b82f6' }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={true}
                    animationDuration={1600}
                    animationEasing="ease-out"
                    animationBegin={350}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Coluna Lateral */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-3 lg:gap-4 flex-1 min-h-0">
          {/* Campeão de Vendas (Top Product) */}
          <Card className="shrink-0 border-accent/30 bg-gradient-to-br from-surface to-accent-muted/10 relative overflow-hidden">
            <CardHeader className="p-2.5 pb-1 lg:p-3 lg:pb-1">
              <CardTitle className="text-foreground flex items-center gap-1.5 text-xs 2xl:text-sm font-semibold">
                <Trophy className="w-3.5 h-3.5 text-status-warning-text" />
                Destaque da Semana
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 pt-0 lg:p-3 lg:pt-0">
              {summary.topProduct ? (
                <div>
                  <p
                    className="text-sm sm:text-base 2xl:text-lg font-bold text-foreground leading-tight truncate"
                    title={summary.topProduct.name}
                  >
                    {summary.topProduct.name}
                  </p>
                  <p className="text-xs text-status-warning-text font-medium mt-0.5">
                    <AnimatedNumber value={summary.topProduct.quantity} /> unidades saíram
                  </p>
                </div>
              ) : (
                <div className="text-muted text-xs mt-1">
                  Nenhuma saída registrada.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Produtos Críticos */}
          <Card className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <CardHeader className="bg-status-critical-bg/5 border-b border-border p-2.5 px-3 lg:p-3 shrink-0">
              <CardTitle className="text-status-critical-text flex items-center gap-1.5 text-xs 2xl:text-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                Alerta de Reposição
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 overflow-y-auto">
              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted">
                  <Package className="w-6 h-6 mb-1.5 opacity-20" />
                  <p className="text-xs">Estoque saudável!</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {lowStock.map((item) => (
                    <li
                      key={item.id}
                      className="p-2 px-3 hover:bg-surface transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate text-xs">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-muted font-mono">
                          {item.sku}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-0.5">
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
