import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import { ArrowLeft, DollarSign, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ClienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const { clientes, registerPayment } = useApp();
  const navigate = useNavigate();
  const client = clientes.find(c => c.id === id);
  const [showPay, setShowPay] = useState(false);
  const [payAmount, setPayAmount] = useState('');

  if (!client) return <div className="p-6 text-center text-muted-foreground">Cliente no encontrado</div>;

  const handlePay = async () => {
    await registerPayment(client.id, Number(payAmount));
    toast.success('Pago registrado');
    setShowPay(false);
    setPayAmount('');
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
          <p className="text-sm text-muted-foreground">{client.phone}</p>
        </div>
      </div>

      {/* Balance */}
      <Card className="border-0 shadow-sm bg-warning/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Saldo pendiente</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(client.debt)}</p>
          </div>
          <Button onClick={() => { setShowPay(true); setPayAmount(String(client.debt)); }} className="gap-1">
            <DollarSign size={16} /> Registrar Pago
          </Button>
        </CardContent>
      </Card>

      {/* Purchases */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <ShoppingCart size={14} /> Compras fiadas
        </h3>
        <div className="space-y-2">
          {client.purchases.map((p, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{p.detail}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                </div>
                <p className="text-sm font-semibold text-destructive">{formatCurrency(p.amount)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payments */}
      {client.payments.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <DollarSign size={14} /> Pagos registrados
          </h3>
          <div className="space-y-2">
            {client.payments.map((p, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                  <p className="text-sm font-semibold text-primary">+{formatCurrency(p.amount)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pay dialog */}
      <Dialog open={showPay} onOpenChange={setShowPay}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Deuda actual: <span className="font-semibold text-foreground">{formatCurrency(client.debt)}</span></p>
            <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Monto" className="h-12 text-lg font-semibold" />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPayAmount(String(client.debt))} className="flex-1 h-10 text-sm">
                Pago total
              </Button>
            </div>
            <Button onClick={handlePay} disabled={!payAmount || Number(payAmount) <= 0} className="w-full h-11 font-semibold">
              Confirmar Pago
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
