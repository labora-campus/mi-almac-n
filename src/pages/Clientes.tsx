import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { Users, Plus, ChevronRight, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Clientes() {
  const { clientes, addClient } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const totalDebt = clientes.reduce((s, c) => s + c.debt, 0);
  const sorted = [...clientes].sort((a, b) => b.debt - a.debt);

  const handleAdd = async () => {
    await addClient(name, phone);
    setShowAdd(false);
    setName('');
    setPhone('');
    toast.success('Cliente agregado');
  };

  const getDebtColor = (debt: number) => {
    if (debt >= 10000) return 'text-destructive';
    if (debt >= 5000) return 'text-warning';
    if (debt > 0) return 'text-foreground';
    return 'text-primary';
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Clientes</h1>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1">
          <Plus size={16} /> Nuevo
        </Button>
      </div>

      {/* Total fiado */}
      <Card className="border-0 shadow-sm bg-warning/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Users size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Total fiado pendiente</p>
              <p className="text-xs text-muted-foreground">{clientes.filter(c => c.debt > 0).length} clientes con deuda</p>
            </div>
          </div>
          <p className="text-xl font-bold text-warning">{formatCurrency(totalDebt)}</p>
        </CardContent>
      </Card>

      {/* Client list */}
      <div className="space-y-2">
        {sorted.map(c => (
          <Card key={c.id} className="border-0 shadow-sm cursor-pointer" onClick={() => navigate(`/clientes/${c.id}`)}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone size={10} />
                  {c.phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className={cn('text-sm font-bold', getDebtColor(c.debt))}>
                  {c.debt > 0 ? formatCurrency(c.debt) : 'Al día'}
                </p>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add client dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" className="h-11" />
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="11-1234-5678" className="h-11" />
            </div>
            <Button onClick={handleAdd} disabled={!name.trim()} className="w-full h-11 font-semibold">
              Agregar Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
