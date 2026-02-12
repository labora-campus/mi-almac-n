import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, getCategoryColorClass, getStockStatus, getStockColorClass } from '@/lib/format';
import { ALL_CATEGORIES, type Category, type Unit } from '@/data/mockData';
import { ArrowLeft, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const { productos, updateProduct } = useApp();
  const navigate = useNavigate();
  const product = productos.find(p => p.id === id);

  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState<Category>(product?.category || 'Almacén');
  const [costPrice, setCostPrice] = useState(String(product?.costPrice || ''));
  const [sellPrice, setSellPrice] = useState(String(product?.sellPrice || ''));
  const [stock, setStock] = useState(String(product?.stock || ''));
  const [minStock, setMinStock] = useState(String(product?.minStock || ''));
  const [unit, setUnit] = useState<Unit>(product?.unit || 'unidad');

  if (!product) return <div className="p-6 text-center text-muted-foreground">Producto no encontrado</div>;

  const profit = Number(sellPrice) - Number(costPrice);
  const profitPct = Number(costPrice) > 0 ? ((profit / Number(costPrice)) * 100).toFixed(0) : '0';
  const status = getStockStatus(Number(stock), Number(minStock));

  const handleSave = () => {
    updateProduct({
      ...product,
      name, category, costPrice: Number(costPrice), sellPrice: Number(sellPrice),
      stock: Number(stock), minStock: Number(minStock), unit,
    });
    toast.success('Producto actualizado');
    navigate('/productos');
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Editar Producto</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getCategoryColorClass(product.category))}>{product.category}</span>
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getStockColorClass(status))}>
          Stock: {product.stock}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Nombre</Label>
          <Input value={name} onChange={e => setName(e.target.value)} className="h-11 text-base" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Categoría</Label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm">
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Unidad</Label>
            <select value={unit} onChange={e => setUnit(e.target.value as Unit)} className="w-full h-11 rounded-lg border border-border bg-card px-3 text-sm">
              <option value="unidad">Unidad</option>
              <option value="kg">Kg</option>
              <option value="litro">Litro</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Precio de costo</Label>
            <Input type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1">
            <Label>Precio de venta</Label>
            <Input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} className="h-11" />
          </div>
        </div>
        {Number(costPrice) > 0 && Number(sellPrice) > 0 && (
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-3">
              <p className="text-sm font-semibold text-primary">Ganás {formatCurrency(profit)} por {unit} ({profitPct}%)</p>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Stock actual</Label>
            <Input type="number" value={stock} onChange={e => setStock(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1">
            <Label>Stock mínimo</Label>
            <Input type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="h-11" />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full h-12 text-base font-semibold gap-2">
          <Save size={18} /> Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
