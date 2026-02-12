import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, getCategoryColorClass, getStockStatus, getStockColorClass } from '@/lib/format';
import { ALL_CATEGORIES, type Category, type Unit } from '@/data/mockData';
import { Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Productos() {
  const { productos, addProduct } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('Todas');
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [fName, setFName] = useState('');
  const [fCategory, setFCategory] = useState<Category>('Almacén');
  const [fCost, setFCost] = useState('');
  const [fSell, setFSell] = useState('');
  const [fStock, setFStock] = useState('');
  const [fMinStock, setFMinStock] = useState('5');
  const [fUnit, setFUnit] = useState<Unit>('unidad');

  const profit = Number(fSell) - Number(fCost);
  const profitPct = Number(fCost) > 0 ? ((profit / Number(fCost)) * 100).toFixed(0) : '0';

  const filtered = useMemo(() => {
    let list = productos;
    if (filterCat !== 'Todas') list = list.filter(p => p.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [productos, search, filterCat]);

  const handleAdd = () => {
    addProduct({
      name: fName, category: fCategory, costPrice: Number(fCost), sellPrice: Number(fSell),
      stock: Number(fStock), minStock: Number(fMinStock), unit: fUnit,
    });
    setShowAdd(false);
    setFName(''); setFCost(''); setFSell(''); setFStock(''); setFMinStock('5');
    toast.success('Producto agregado');
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Productos</h1>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1">
          <Plus size={16} /> Agregar
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 text-base" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {['Todas', ...ALL_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              filterCat === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {filtered.map(p => {
          const status = getStockStatus(p.stock, p.minStock);
          const profitAmt = p.sellPrice - p.costPrice;
          const profitP = p.costPrice > 0 ? Math.round((profitAmt / p.costPrice) * 100) : 0;
          return (
            <Card key={p.id} className="border-0 shadow-sm cursor-pointer" onClick={() => navigate(`/productos/${p.id}`)}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getCategoryColorClass(p.category))}>{p.category}</span>
                    <span className="text-xs text-primary font-medium">+{profitP}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(p.sellPrice)}</p>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getStockColorClass(status))}>
                    {p.stock} {p.unit === 'kg' ? 'kg' : p.unit === 'litro' ? 'L' : 'u.'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={fName} onChange={e => setFName(e.target.value)} placeholder="Ej: Coca-Cola 1.5L" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select value={fCategory} onChange={e => setFCategory(e.target.value as Category)} className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm">
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Unidad</Label>
                <select value={fUnit} onChange={e => setFUnit(e.target.value as Unit)} className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm">
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kg</option>
                  <option value="litro">Litro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Precio de costo</Label>
                <Input type="number" value={fCost} onChange={e => setFCost(e.target.value)} placeholder="$0" className="h-11" />
              </div>
              <div className="space-y-1">
                <Label>Precio de venta</Label>
                <Input type="number" value={fSell} onChange={e => setFSell(e.target.value)} placeholder="$0" className="h-11" />
              </div>
            </div>
            {Number(fCost) > 0 && Number(fSell) > 0 && (
              <p className="text-sm font-medium text-primary">
                Ganás {formatCurrency(profit)} por {fUnit} ({profitPct}%)
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Stock inicial</Label>
                <Input type="number" value={fStock} onChange={e => setFStock(e.target.value)} placeholder="0" className="h-11" />
              </div>
              <div className="space-y-1">
                <Label>Stock mínimo</Label>
                <Input type="number" value={fMinStock} onChange={e => setFMinStock(e.target.value)} placeholder="5" className="h-11" />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!fName.trim() || !fCost || !fSell} className="w-full h-11 font-semibold">
              Agregar Producto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
