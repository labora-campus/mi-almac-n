import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Cuenta creada. Por favor verificá tu email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // User will be redirected by AuthWrapper/Guard
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Mi Almacén" className="w-20 h-20 rounded-2xl" />
          <h1 className="text-2xl font-bold text-foreground">Mi Almacén</h1>
          <p className="text-muted-foreground text-center">
            Gestioná tu negocio de forma simple
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-semibold text-foreground text-center">
                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              </h2>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 text-base"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                {loading ? 'Cargando...' : (isRegister ? 'Registrarme' : 'Entrar')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground">
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-primary font-semibold underline-offset-2 hover:underline"
          >
            {isRegister ? 'Iniciá sesión' : 'Registrate'}
          </button>
        </p>
      </div>
    </div>
  );
}
