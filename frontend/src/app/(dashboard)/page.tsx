'use client';

import { useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, ArrowLeftRight, Activity } from 'lucide-react';
import {
  BarChart,
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

/**
 * @description Página principal do Dashboard (rota `/`).
 * Orquestra e apresenta o resumo do negócio utilizando o Recharts para visualização gráfica.
 * Contém KPIs financeiros, volumetria diária e uma tabela crítica de reposição de estoque.
 */
export default function DashboardPage() {
  const { summary, chart, lowStock, isLoading, error, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted mt-1">Visão geral do seu negócio e status do inventário</p>
      </div>

      {/* KPIs / Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Total de Produtos</CardTitle>
            <Package className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.totalProducts}</div>
            <p className="text-xs text-muted mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:border-status-ok-text/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Valor em Estoque</CardTitle>
            <TrendingUp className="w-5 h-5 text-status-ok-text" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(summary.totalValue)}
            </div>
            <p className="text-xs text-muted mt-1">Baseado no preço de venda</p>
          </CardContent>
        </Card>

        <Card className="hover:border-status-critical-text/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Estoque Crítico</CardTitle>
            <AlertTriangle className="w-5 h-5 text-status-critical-text" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-status-critical-text">
              {summary.criticalItems}
            </div>
            <p className="text-xs text-muted mt-1">Abaixo ou igual ao mínimo</p>
          </CardContent>
        </Card>

        <Card className="hover:border-accent-hover/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">Movimentações Hoje</CardTitle>
            <ArrowLeftRight className="w-5 h-5 text-accent-hover" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.todayMovements}</div>
            <p className="text-xs text-muted mt-1">Entradas e Saídas diárias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Gráfico de Barras */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Histórico de Movimentações (7 Dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.4} />
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
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip
                    cursor={{ fill: '#333', opacity: 0.2 }}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="entries" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="exits" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos Críticos */}
        <Card className="col-span-1 lg:col-span-3 overflow-hidden flex flex-col">
          <CardHeader className="bg-status-critical-bg/5 border-b border-border">
            <CardTitle className="text-status-critical-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alerta de Reposição
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted">
                <Package className="w-10 h-10 mb-3 opacity-20" />
                <p>Estoque saudável!</p>
                <p className="text-xs mt-1">Nenhum produto abaixo do limite mínimo.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {lowStock.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-surface transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted font-mono">{item.sku}</span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-background border border-border rounded-full text-muted truncate max-w-[120px]">
                          {item.categoryName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge variant="destructive" className="font-mono">
                        {item.quantity} / {item.minQuantity}
                      </Badge>
                      <span className="text-[10px] text-muted uppercase">Atual / Min</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
