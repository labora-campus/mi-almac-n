import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Package, Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Inicio', icon: Home },
  { path: '/venta', label: 'Vender', icon: ShoppingCart },
  { path: '/productos', label: 'Productos', icon: Package },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
];

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-16 z-50 safe-area-bottom">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[56px] rounded-lg transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon size={22} />
            <span className="text-[11px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
