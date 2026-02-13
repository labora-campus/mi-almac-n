import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import NuevaVenta from "@/pages/NuevaVenta";
import Productos from "@/pages/Productos";
import ProductoDetalle from "@/pages/ProductoDetalle";
import Stock from "@/pages/Stock";
import Clientes from "@/pages/Clientes";
import ClienteDetalle from "@/pages/ClienteDetalle";
import Reportes from "@/pages/Reportes";
import Configuracion from "@/pages/Configuracion";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { hasOnboarded } = useApp();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // For now, we keep hasOnboarded check from AppContext, 
  // but in the future this should come from user profile
  if (!hasOnboarded) return <Navigate to="/onboarding" replace />;

  return <Layout />;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { hasOnboarded } = useApp();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (hasOnboarded) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
              <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/venta" element={<NuevaVenta />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:id" element={<ProductoDetalle />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/clientes/:id" element={<ClienteDetalle />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
