import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ALL_CATEGORIES } from '@/data/mockData';
import { Check, Store, Tag, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding(name || 'Mi Almacén', address, categories);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in onboarding:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 bg-background">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              {s < step ? <Check size={16} /> : s}
            </div>
            {s < 3 && <div className={cn('flex-1 h-1 rounded-full', s < step ? 'bg-primary' : 'bg-muted')} />}
          </div>
        ))}
      </div>

      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <Store className="text-primary" size={28} />
              <h1 className="text-2xl font-bold text-foreground">¿Cómo se llama tu almacén?</h1>
            </div>
            <div className="space-y-2">
              <Label className="text-base">Nombre del almacén</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Almacén Don Pedro"
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Dirección (opcional)</Label>
              <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ej: Av. San Martín 1234"
                className="h-12 text-base"
              />
            </div>
            <Button onClick={() => setStep(2)} className="w-full h-12 text-base font-semibold" disabled={!name.trim()}>
              Siguiente
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <Tag className="text-primary" size={28} />
              <h1 className="text-2xl font-bold text-foreground">¿Qué vendés?</h1>
            </div>
            <p className="text-muted-foreground">Seleccioná las categorías de productos que manejás</p>
            <div className="flex flex-wrap gap-3">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-base font-medium transition-all border-2',
                    categories.includes(cat)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 text-base">
                Atrás
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-12 text-base font-semibold" disabled={categories.length === 0}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center space-y-6 pt-10 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="text-primary" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">¡Todo listo, {name || 'amigo'}!</h1>
            <p className="text-muted-foreground text-lg">
              Tu almacén está configurado. Empezá cargando tus productos o registrando tu primera venta.
            </p>
            <Button onClick={handleFinish} className="w-full h-12 text-base font-semibold">
              Cargar mi primer producto
            </Button>
            <Button variant="ghost" onClick={handleFinish} className="text-base text-muted-foreground">
              Ir al inicio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
