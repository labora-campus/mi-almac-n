import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, getStockStatus, getStockColorClass } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Package, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Product } from '@/data/mockData';

type Filter = 'all' | 'low' | 'out';

export default function Stock() {
  const { productos, adjustStock, stockMovements } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState('');

  const filtered = useMemo(() => {
    return productos.filter(p => {
      const s = getStockStatus(p.stock, p.minStock);
      if (filter === 'low') return s === 'low';
      if (filter === 'out') return s === 'out';
      return true;
    });
  }, [productos, filter]);

  const handleAdjust = () => {
    if (!adjusting || delta === 0) return;
    adjustStock(adjusting.id, delta, reason || (delta > 0 ? 'Ingreso de mercadería' : 'Ajuste de stock'));
    toast.success('Stock actualizado');
    setAdjusting(null);
    setDelta(0);
    setReason('');
  };

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'low', label: 'Stock bajo' },
    { value: 'out', label: 'Sin stock' },
  ];

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <h1 className="text-xl font-bold text-foreground">Inventario</h1>

      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(p => {
          const status = getStockStatus(p.stock, p.minStock);
          return (
            <Card key={p.id} className="border-0 shadow-sm cursor-pointer" onClick={() => { setAdjusting(p); setDelta(0); setReason(''); }}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Package size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Mínimo: {p.minStock}</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-sm font-semibold px-2.5 py-1 rounded-full', getStockColorClass(status))}>
                    {p.stock} {p.unit === 'kg' ? 'kg' : p.unit === 'litro' ? 'L' : 'u.'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjusting} onOpenChange={() => setAdjusting(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Ajustar Stock — {adjusting?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Stock actual: <span className="font-semibold text-foreground">{adjusting?.stock}</span></p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setDelta(d => d - 1)} className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-lg font-bold">
                <Minus size={20} />
              </button>
              <span className={cn('text-3xl font-bold min-w-[60px] text-center', delta > 0 ? 'text-primary' : delta < 0 ? 'text-destructive' : 'text-foreground')}>
                {delta > 0 ? '+' : ''}{delta}
              </span>
              <button onClick={() => setDelta(d => d + 1)} className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                <Plus size={20} />
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Nuevo stock: <span className="font-semibold text-foreground">{Math.max(0, (adjusting?.stock || 0) + delta)}</span>
            </p>
            <Input placeholder="Motivo (opcional)" value={reason} onChange={e => setReason(e.target.value)} className="h-11" />

            {/* Movement history */}
            {adjusting && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Últimos movimientos</p>
                {stockMovements.filter(m => m.productId === adjusting.id).slice(-3).map(m => (
                  <div key={m.id} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="text-muted-foreground">{m.date}</span>
                    <span className={cn('font-medium', m.quantity > 0 ? 'text-primary' : 'text-destructive')}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity} — {m.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={handleAdjust} disabled={delta === 0} className="w-full h-11 font-semibold">
              Confirmar Ajuste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
