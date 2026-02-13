import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { PaymentMethod } from '@/data/mockData';
import { Search, Plus, Minus, X, Banknote, Smartphone, CreditCard, UserCheck, Check, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 'cart' | 'payment' | 'success';

export default function NuevaVenta() {
  const { productos, clientes, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, addSale, addClient } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('cart');
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [cashPaid, setCashPaid] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const total = cart.reduce((s, i) => s + i.product.sellPrice * i.quantity, 0);
  const change = cashPaid ? Math.max(0, Number(cashPaid) - total) : 0;

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return productos.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [search, productos]);

  const handleConfirm = async () => {
    let clientId = selectedClientId;
    if (paymentMethod === 'fiado' && showNewClient && newClientName.trim()) {
      const newC = await addClient(newClientName, newClientPhone);
      clientId = newC.id;
    }

    await addSale({
      date: new Date().toISOString(),
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.sellPrice,
        subtotal: i.product.sellPrice * i.quantity,
      })),
      total,
      paymentMethod,
      clientId: paymentMethod === 'fiado' ? clientId : undefined,
    });

    clearCart();
    setStep('success');
    toast.success('¡Venta registrada!');
  };

  const paymentOptions: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { method: 'efectivo', label: 'Efectivo', icon: <Banknote size={20} /> },
    { method: 'transferencia', label: 'Transferencia', icon: <Smartphone size={20} /> },
    { method: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={20} /> },
    { method: 'fiado', label: 'Fiado', icon: <UserCheck size={20} /> },
  ];

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
        <div className="animate-scale-check mb-6">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
            <Check size={48} className="text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">¡Venta registrada!</h1>
        <p className="text-muted-foreground text-lg mb-8">{formatCurrency(total)}</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => { setStep('cart'); setSearch(''); setCashPaid(''); setPaymentMethod('efectivo'); setSelectedClientId(''); }} className="h-12 text-base font-semibold">
            Nueva Venta
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="h-12 text-base">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-xl font-bold text-foreground">Nueva Venta</h1>
      </div>

      {/* Search */}
      <div className="px-4 relative">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="pl-10 h-12 text-base"
          />
        </div>
        {showSearch && filteredProducts.length > 0 && (
          <Card className="absolute left-4 right-4 top-14 z-30 border shadow-lg">
            <CardContent className="p-2">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => { addToCart(p); setSearch(''); setShowSearch(false); toast.success(`${p.name} agregado`); }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · Stock: {p.stock}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{formatCurrency(p.sellPrice)}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cart */}
      <div className="flex-1 px-4 mt-4 space-y-2 overflow-auto" style={{ paddingBottom: step === 'payment' ? 320 : 160 }}>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ShoppingCart size={48} strokeWidth={1.5} className="mb-3 opacity-40" />
            <p className="text-base">Buscá un producto para empezar</p>
          </div>
        ) : (
          cart.map(item => (
            <Card key={item.product.id} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.product.sellPrice)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-sm font-semibold text-foreground w-20 text-right">{formatCurrency(item.product.sellPrice * item.quantity)}</p>
                <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive">
                  <X size={16} />
                </button>
              </CardContent>
            </Card>
          ))
        )}

        {/* Payment section */}
        {step === 'payment' && cart.length > 0 && (
          <div className="space-y-4 pt-4 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-foreground">Método de pago</h3>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map(opt => (
                <button
                  key={opt.method}
                  onClick={() => setPaymentMethod(opt.method)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                    paymentMethod === opt.method
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-foreground'
                  )}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'efectivo' && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Pagó con:</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={cashPaid}
                  onChange={e => setCashPaid(e.target.value)}
                  className="h-12 text-lg font-semibold"
                />
                {Number(cashPaid) >= total && (
                  <p className="text-base font-semibold text-primary">
                    Vuelto: {formatCurrency(change)}
                  </p>
                )}
              </div>
            )}

            {paymentMethod === 'fiado' && (
              <div className="space-y-3">
                {!showNewClient ? (
                  <>
                    <select
                      value={selectedClientId}
                      onChange={e => setSelectedClientId(e.target.value)}
                      className="w-full h-12 rounded-lg border border-border bg-card px-3 text-base text-foreground"
                    >
                      <option value="">Seleccionar cliente</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (debe {formatCurrency(c.debt)})</option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={() => setShowNewClient(true)} className="w-full h-10 text-sm">
                      + Nuevo cliente
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Input placeholder="Nombre del cliente" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="h-12 text-base" />
                    <Input placeholder="Teléfono" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="h-12 text-base" />
                    <Button variant="ghost" onClick={() => setShowNewClient(false)} className="text-sm text-muted-foreground">
                      Seleccionar cliente existente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-foreground">Total</span>
            <span className="text-2xl font-bold text-foreground">{formatCurrency(total)}</span>
          </div>
          {step === 'cart' ? (
            <Button onClick={() => setStep('payment')} className="w-full h-12 text-base font-semibold">
              Elegir método de pago
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              className="w-full h-12 text-base font-semibold"
              disabled={
                (paymentMethod === 'fiado' && !selectedClientId && !newClientName.trim())
              }
            >
              Confirmar Venta
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
