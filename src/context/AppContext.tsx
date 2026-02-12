import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product, Client, Sale, StockMovement, initialProducts, initialClients, todaySales, initialStockMovements, type PaymentMethod, type Category, type Unit } from '@/data/mockData';

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  almacenName: string;
  almacenAddress: string;
  selectedCategories: string[];
  productos: Product[];
  clientes: Client[];
  ventas: Sale[];
  stockMovements: StockMovement[];
  cart: CartItem[];
  login: () => void;
  logout: () => void;
  completeOnboarding: (name: string, address: string, categories: string[]) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  addClient: (name: string, phone: string) => Client;
  registerPayment: (clientId: string, amount: number) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [almacenName, setAlmacenName] = useState('Mi Almacén');
  const [almacenAddress, setAlmacenAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productos, setProductos] = useState<Product[]>(initialProducts);
  const [clientes, setClientes] = useState<Client[]>(initialClients);
  const [ventas, setVentas] = useState<Sale[]>(todaySales);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [cart, setCart] = useState<CartItem[]>([]);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => { setIsLoggedIn(false); setHasOnboarded(false); }, []);

  const completeOnboarding = useCallback((name: string, address: string, categories: string[]) => {
    setAlmacenName(name);
    setAlmacenAddress(address);
    setSelectedCategories(categories);
    setHasOnboarded(true);
  }, []);

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    const id = 'p' + Date.now();
    setProductos(prev => [...prev, { ...p, id }]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProductos(prev => prev.map(x => x.id === p.id ? p : x));
  }, []);

  const adjustStock = useCallback((productId: string, delta: number, reason: string) => {
    setProductos(prev => prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
    setStockMovements(prev => [...prev, {
      id: 'sm' + Date.now(),
      productId,
      date: new Date().toISOString().split('T')[0],
      type: delta > 0 ? 'ingreso' : 'ajuste',
      quantity: delta,
      reason,
    }]);
  }, []);

  const addSale = useCallback((sale: Omit<Sale, 'id'>) => {
    const id = 's' + Date.now();
    setVentas(prev => [...prev, { ...sale, id }]);
    // Reduce stock
    sale.items.forEach(item => {
      setProductos(prev => prev.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p));
    });
    // If fiado, add to client debt
    if (sale.paymentMethod === 'fiado' && sale.clientId) {
      setClientes(prev => prev.map(c => c.id === sale.clientId ? {
        ...c,
        debt: c.debt + sale.total,
        purchases: [...c.purchases, { date: new Date().toISOString().split('T')[0], amount: sale.total, detail: sale.items.map(i => i.productName).join(', ') }]
      } : c));
    }
  }, []);

  const addClient = useCallback((name: string, phone: string): Client => {
    const client: Client = { id: 'c' + Date.now(), name, phone, debt: 0, purchases: [], payments: [] };
    setClientes(prev => [...prev, client]);
    return client;
  }, []);

  const registerPayment = useCallback((clientId: string, amount: number) => {
    setClientes(prev => prev.map(c => c.id === clientId ? {
      ...c,
      debt: Math.max(0, c.debt - amount),
      payments: [...c.payments, { date: new Date().toISOString().split('T')[0], amount }]
    } : c));
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <AppContext.Provider value={{
      isLoggedIn, hasOnboarded, almacenName, almacenAddress, selectedCategories,
      productos, clientes, ventas, stockMovements, cart,
      login, logout, completeOnboarding, addProduct, updateProduct, adjustStock,
      addSale, addClient, registerPayment, addToCart, removeFromCart, updateCartQuantity, clearCart,
    }}>
      {children}
    </AppContext.Provider>
  );
}
