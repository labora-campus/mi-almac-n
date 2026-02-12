import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { getStockStatus } from '@/lib/format';
import { generateDailySummaries } from '@/data/mockData';
import { Plus, DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Users, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { almacenName, ventas, productos, clientes } = useApp();
  const navigate = useNavigate();

  const dailySummaries = useMemo(() => generateDailySummaries(), []);
  const last7 = dailySummaries.slice(-7);

  const todayTotal = ventas.reduce((s, v) => s + v.total, 0);
  const todayCount = ventas.length;
  const todayProfit = Math.round(todayTotal * 0.33);

  const lowStockProducts = productos.filter(p => {
    const status = getStockStatus(p.stock, p.minStock);
    return status === 'low' || status === 'out';
  });

  const totalFiado = clientes.reduce((s, c) => s + c.debt, 0);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Buen día 👋</p>
          <h1 className="text-2xl font-bold text-foreground">{almacenName}</h1>
        </div>
        <button onClick={() => navigate('/configuracion')} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Settings size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign size={16} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Vendido hoy</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(todayTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart size={16} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Ventas</p>
            <p className="text-xl font-bold text-foreground">{todayCount} ventas</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 border-0 shadow-sm bg-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-foreground/70">Ganancia estimada</p>
              <p className="text-2xl font-bold text-primary-foreground">{formatCurrency(todayProfit)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp size={24} className="text-primary-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={last7}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="total" fill="hsl(152, 55%, 38%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attention */}
      {(lowStockProducts.length > 0 || totalFiado > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            Atención
          </h3>

          {lowStockProducts.length > 0 && (
            <Card className="border-0 shadow-sm cursor-pointer" onClick={() => navigate('/stock')}>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground mb-2">Stock bajo</p>
                {lowStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-foreground">{p.name}</span>
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      p.stock <= 0 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    )}>
                      {p.stock} {p.unit === 'kg' ? 'kg' : p.unit === 'litro' ? 'L' : 'u.'}
                    </span>
                  </div>
                ))}
                {lowStockProducts.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-1">+{lowStockProducts.length - 3} más</p>
                )}
              </CardContent>
            </Card>
          )}

          {totalFiado > 0 && (
            <Card className="border-0 shadow-sm cursor-pointer" onClick={() => navigate('/clientes')}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Users size={16} className="text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Fiado pendiente</p>
                    <p className="text-xs text-muted-foreground">{clientes.filter(c => c.debt > 0).length} clientes</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-warning">{formatCurrency(totalFiado)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/venta')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center animate-fab-pulse z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
