import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { generateDailySummaries } from '@/data/mockData';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Period = 'hoy' | 'semana' | 'mes';

const PAYMENT_COLORS = ['hsl(152, 55%, 38%)', 'hsl(210, 80%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(340, 65%, 52%)'];

export default function Reportes() {
  const { ventas } = useApp();
  const [period, setPeriod] = useState<Period>('semana');

  const dailySummaries = useMemo(() => generateDailySummaries(), []);

  const periodData = useMemo(() => {
    switch (period) {
      case 'hoy': return dailySummaries.slice(-1);
      case 'semana': return dailySummaries.slice(-7);
      case 'mes': return dailySummaries;
    }
  }, [period, dailySummaries]);

  const totalSales = periodData.reduce((s, d) => s + d.total, 0);
  const totalProfit = periodData.reduce((s, d) => s + d.profit, 0);
  const totalCount = periodData.reduce((s, d) => s + d.count, 0);
  const avgTicket = totalCount > 0 ? totalSales / totalCount : 0;

  // Previous period comparison
  const prevData = useMemo(() => {
    const len = periodData.length;
    const start = dailySummaries.length - len * 2;
    if (start < 0) return [];
    return dailySummaries.slice(start, start + len);
  }, [periodData, dailySummaries]);

  const prevTotal = prevData.reduce((s, d) => s + d.total, 0);
  const changePercent = prevTotal > 0 ? ((totalSales - prevTotal) / prevTotal * 100).toFixed(1) : '0';
  const isUp = totalSales >= prevTotal;

  // Payment method breakdown (simulated)
  const paymentBreakdown = [
    { name: 'Efectivo', value: 45, pct: '45%' },
    { name: 'Transferencia', value: 25, pct: '25%' },
    { name: 'Tarjeta', value: 20, pct: '20%' },
    { name: 'Fiado', value: 10, pct: '10%' },
  ];

  // Top products (simulated from today's sales)
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; total: number }> = {};
    ventas.forEach(v => v.items.forEach(i => {
      if (!map[i.productId]) map[i.productId] = { name: i.productName, qty: 0, total: 0 };
      map[i.productId].qty += i.quantity;
      map[i.productId].total += i.subtotal;
    }));
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [ventas]);

  const maxQty = topProducts.length > 0 ? topProducts[0].qty : 1;

  const periods: { value: Period; label: string }[] = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
  ];

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Reportes</h1>
        <Button variant="outline" size="sm" onClick={() => toast.info('Próximamente')} className="gap-1 text-xs">
          <Download size={14} /> Descargar
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex gap-2">
        {periods.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-1 text-center',
              period === p.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ventas totales</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalSales)}</p>
            <div className="flex items-center gap-1 mt-1">
              {isUp ? <TrendingUp size={12} className="text-primary" /> : <TrendingDown size={12} className="text-destructive" />}
              <span className={cn('text-xs font-medium', isUp ? 'text-primary' : 'text-destructive')}>
                {isUp ? '+' : ''}{changePercent}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ganancia</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(totalProfit)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Cantidad de ventas</p>
            <p className="text-lg font-bold text-foreground">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ticket promedio</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(avgTicket)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales chart */}
      {period !== 'hoy' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Evolución de ventas</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={periodData}>
                <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Ventas']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="total" stroke="hsl(152, 55%, 38%)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment breakdown */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Métodos de pago</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={100} height={100}>
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={45}>
                  {paymentBreakdown.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {paymentBreakdown.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i] }} />
                    <span className="text-xs text-foreground">{p.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{p.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top products */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Más vendidos</h3>
          <div className="space-y-2.5">
            {topProducts.map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.qty} vendidos</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(p.qty / maxQty) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
