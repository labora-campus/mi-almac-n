import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
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
  completeOnboarding: (name: string, address: string, categories: string[]) => Promise<void>;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  addSale: (sale: Omit<Sale, 'id'>) => Promise<void>;
  addClient: (name: string, phone: string) => Promise<Client>;
  registerPayment: (clientId: string, amount: number) => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  seedDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [almacenName, setAlmacenName] = useState('Mi Almacén');
  const [almacenAddress, setAlmacenAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [clientes, setClientes] = useState<Client[]>([]);
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => { setIsLoggedIn(false); setHasOnboarded(false); }, []);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        // Fetch Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setAlmacenName(profile.almacen_name || 'Mi Almacén');
          setAlmacenAddress(profile.address || '');
          setSelectedCategories(profile.categories || []);
          setHasOnboarded(profile.has_onboarded || false);
        }

        // Fetch Products
        const { data: productsData } = await supabase.from('products').select('*');
        if (productsData) {
          setProductos(productsData.map(p => ({
            id: p.id,
            name: p.name,
            barcode: p.barcode,
            sellPrice: Number(p.price),
            costPrice: Number(p.cost),
            stock: Number(p.stock),
            minStock: Number(p.min_stock),
            category: p.category,
            unit: p.unit,
            image: p.image
          })));
        }

        // Fetch Stock Movements
        const { data: movementsData } = await supabase.from('stock_movements').select('*').order('date', { ascending: false });
        if (movementsData) {
          setStockMovements(movementsData.map(m => ({
            id: m.id,
            productId: m.product_id,
            productName: '', // logic to get name would be better in a join, but for now we can map later or ignore
            type: m.type as any,
            quantity: Number(m.quantity),
            date: m.date,
            reason: m.reason
          })));
        }

        // Fetch Clients
        const { data: clientsData } = await supabase.from('clients').select('*');
        if (clientsData) {
          setClientes(clientsData.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            debt: Number(c.debt),
            purchases: [], // Loading history lazily would be better, but for now empty
            payments: []
          })));
        }

        // Fetch Sales
        const { data: salesData } = await supabase.from('sales').select('*, sale_items(*)').order('date', { ascending: false });
        if (salesData) {
          setVentas(salesData.map(s => ({
            id: s.id,
            date: s.date,
            total: Number(s.total),
            paymentMethod: s.payment_method as any,
            clientId: s.client_id,
            items: s.sale_items.map((i: any) => ({
              productId: i.product_id,
              productName: i.product_name,
              quantity: Number(i.quantity),
              unitPrice: Number(i.unit_price),
              subtotal: Number(i.subtotal)
            }))
          })));
        }
      };

      fetchData();
    } else {
      setHasOnboarded(false);
      setProductos([]);
      setStockMovements([]);
      setClientes([]);
      setVentas([]);
    }
  }, [user]);

  const completeOnboarding = useCallback(async (name: string, address: string, categories: string[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        almacen_name: name,
        address,
        categories,
        has_onboarded: true,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    setAlmacenName(name);
    setAlmacenAddress(address);
    setSelectedCategories(categories);
    setHasOnboarded(true);
  }, [user]);

  const addProduct = useCallback(async (p: Omit<Product, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('products').insert({
      user_id: user.id,
      name: p.name,
      barcode: p.barcode,
      price: p.sellPrice,
      cost: p.costPrice,
      stock: p.stock,
      min_stock: p.minStock,
      category: p.category,
      unit: p.unit,
      image: p.image
    }).select().single();

    if (error) {
      console.error('Error adding product:', error);
      return;
    }

    if (data) {
      setProductos(prev => [...prev, { ...p, id: data.id }]);
    }
  }, [user]);

  const updateProduct = useCallback(async (p: Product) => {
    if (!user) return;

    const { error } = await supabase.from('products').update({
      name: p.name,
      barcode: p.barcode,
      price: p.sellPrice,
      cost: p.costPrice,
      stock: p.stock,
      min_stock: p.minStock,
      category: p.category,
      unit: p.unit,
      image: p.image
    }).eq('id', p.id);

    if (error) {
      console.error('Error updating product:', error);
      return;
    }

    setProductos(prev => prev.map(x => x.id === p.id ? p : x));
  }, [user]);

  const adjustStock = useCallback(async (productId: string, delta: number, reason: string) => {
    if (!user) return;

    // We should ideally do this in a transaction or Edge Function, but for now 2 calls
    const product = productos.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);

    // Update Product Stock
    const { error: stockError } = await supabase.from('products').update({ stock: newStock }).eq('id', productId);
    if (stockError) {
      console.error('Error updating stock', stockError);
      return;
    }

    // Create Movement
    const { data: movementData, error: movementError } = await supabase.from('stock_movements').insert({
      user_id: user.id,
      product_id: productId,
      type: delta > 0 ? 'ingreso' : 'ajuste',
      quantity: delta,
      reason
    }).select().single();

    if (movementError) console.error('Error creating movement', movementError);

    // Update Local State
    setProductos(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    if (movementData) {
      setStockMovements(prev => [...prev, {
        id: movementData.id,
        productId,
        productName: product.name,
        date: movementData.date,
        type: delta > 0 ? 'ingreso' : 'ajuste',
        quantity: delta,
        reason
      }]);
    }
  }, [user, productos]);

  const addSale = useCallback(async (sale: Omit<Sale, 'id'>) => {
    if (!user) return;

    // 1. Insert Sale
    const { data: saleData, error: saleError } = await supabase.from('sales').insert({
      user_id: user.id,
      client_id: sale.clientId,
      total: sale.total,
      payment_method: sale.paymentMethod,
      date: new Date().toISOString()
    }).select().single();

    if (saleError || !saleData) {
      console.error('Error creating sale:', saleError);
      return;
    }

    // 2. Insert Sale Items
    const itemsToInsert = sale.items.map(item => ({
      sale_id: saleData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    }));

    const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
    if (itemsError) console.error('Error inserting items:', itemsError);

    // 3. Update Custom Stock & 4. Update Client Debt
    // Note: We already have adjustStock but it creates a movement. 
    // Sales should also create 'venta' movements.

    // We update local state optimistically or re-fetch. 
    // For MVP, let's update local state and assume server handles it? 
    // No, we must update stock in DB.

    for (const item of sale.items) {
      const product = productos.find(p => p.id === item.productId);
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
        await supabase.from('stock_movements').insert({
          user_id: user.id,
          product_id: item.productId,
          type: 'venta',
          quantity: -item.quantity,
          reason: 'Venta ' + saleData.id.slice(0, 8) // Short ID
        });
      }
    }

    if (sale.clientId && sale.paymentMethod === 'fiado') {
      const client = clientes.find(c => c.id === sale.clientId);
      if (client) {
        await supabase.from('clients').update({ debt: client.debt + sale.total }).eq('id', sale.clientId);
      }
    }

    // Ideally re-fetch everything to be safe, or update local state
    // Let's just update local state to reflect UI changes immediately
    setVentas(prev => [{ ...sale, id: saleData.id }, ...prev]);

    sale.items.forEach(item => {
      setProductos(prev => prev.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p));
    });

    if (sale.clientId && sale.paymentMethod === 'fiado') {
      setClientes(prev => prev.map(c => c.id === sale.clientId ? { ...c, debt: c.debt + sale.total } : c));
    }

  }, [user, productos, clientes]);

  const addClient = useCallback(async (name: string, phone: string) => {
    if (!user) return { id: '', name, phone, debt: 0, purchases: [], payments: [] };

    const { data, error } = await supabase.from('clients').insert({
      user_id: user.id,
      name,
      phone,
      debt: 0
    }).select().single();

    if (error || !data) {
      console.error('Error adding client', error);
      throw error;
    }

    const newClient: Client = { id: data.id, name, phone, debt: 0, purchases: [], payments: [] };
    setClientes(prev => [...prev, newClient]);
    return newClient;
  }, [user]);

  const registerPayment = useCallback(async (clientId: string, amount: number) => {
    if (!user) return;

    const client = clientes.find(c => c.id === clientId);
    if (!client) return;

    // 1. Insert Payment
    const { error: payError } = await supabase.from('client_payments').insert({
      user_id: user.id,
      client_id: clientId,
      amount,
      date: new Date().toISOString()
    });

    if (payError) {
      console.error('Error registering payment', payError);
      return;
    }

    // 2. Update Debt
    const newDebt = Math.max(0, client.debt - amount);
    await supabase.from('clients').update({ debt: newDebt }).eq('id', clientId);

    // 3. Update Local
    setClientes(prev => prev.map(c => c.id === clientId ? {
      ...c,
      debt: newDebt,
      payments: [...c.payments, { date: new Date().toISOString().split('T')[0], amount }]
    } : c));
  }, [user, clientes]);

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


  const seedDatabase = useCallback(async () => {
    if (!user) return;

    // Check if products exist to avoid double seeding (simple check)
    if (productos.length > 0) {
      alert('Ya hay productos cargados. No se puede sembrar la base de datos.');
      return;
    }

    const { error } = await supabase.from('products').insert(
      initialProducts.map(p => ({
        user_id: user.id,
        name: p.name,
        barcode: p.barcode, // This might be undefined in mockData but we added it to interface. It's safe.
        price: p.sellPrice,
        cost: p.costPrice,
        stock: p.stock,
        min_stock: p.minStock,
        category: p.category,
        unit: p.unit,
        image: p.image
      }))
    );

    if (error) {
      console.error('Error seeding database:', error);
      alert('Error al cargar datos de prueba');
    } else {
      // Refresh products
      const { data: productsData } = await supabase.from('products').select('*');
      if (productsData) {
        setProductos(productsData.map(p => ({
          id: p.id,
          name: p.name,
          barcode: p.barcode,
          sellPrice: Number(p.price),
          costPrice: Number(p.cost),
          stock: Number(p.stock),
          minStock: Number(p.min_stock),
          category: p.category,
          unit: p.unit,
          image: p.image
        })));
      }
      alert('Datos de prueba cargados correctamente');
    }
  }, [user, productos]);

  return (
    <AppContext.Provider value={{
      isLoggedIn, hasOnboarded, almacenName, almacenAddress, selectedCategories,
      productos, clientes, ventas, stockMovements, cart,
      login, logout, completeOnboarding, addProduct, updateProduct, adjustStock,
      addSale, addClient, registerPayment, addToCart, removeFromCart, updateCartQuantity, clearCart,
      seedDatabase
    }}>
      {children}
    </AppContext.Provider>
  );
}
