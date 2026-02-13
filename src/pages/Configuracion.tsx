import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LogOut, UserPlus, Crown, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Configuracion() {
  const { almacenName, almacenAddress, logout, seedDatabase } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(almacenName);
  const [address, setAddress] = useState(almacenAddress);

  const team = [
    { name: 'Vos', role: 'Dueño', icon: Crown },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Configuración</h1>
      </div>

      {/* Store info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Datos del almacén</h3>
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-1">
            <Label>Dirección</Label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección del almacén" className="h-11" />
          </div>
          <Button onClick={() => toast.success('Datos guardados')} className="w-full h-10 text-sm font-semibold">
            Guardar
          </Button>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Equipo</h3>
          {team.map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <m.icon size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{m.role}</span>
            </div>
          ))}
          <Button variant="outline" onClick={() => toast.info('Próximamente')} className="w-full h-10 text-sm gap-1">
            <UserPlus size={14} /> Invitar empleado
          </Button>
          <p className="text-xs text-muted-foreground">Los empleados pueden registrar ventas y ver productos. Solo el dueño puede ver reportes y editar precios.</p>
        </CardContent>
      </Card>

      {/* Database */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Base de Datos</h3>
          <p className="text-xs text-muted-foreground">
            Cargá productos de prueba para empezar rápido. Solo funciona si la base de datos está vacía.
          </p>
          <Button
            variant="secondary"
            onClick={seedDatabase}
            className="w-full h-10 text-sm font-semibold"
          >
            Cargar productos de ejemplo
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" onClick={handleLogout} className="w-full h-12 text-base text-destructive border-destructive/20 hover:bg-destructive/5 gap-2">
        <LogOut size={18} /> Cerrar Sesión
      </Button>
    </div>
  );
}
