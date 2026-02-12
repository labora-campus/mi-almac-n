export type Category = 'Bebidas' | 'Lácteos' | 'Almacén' | 'Limpieza' | 'Golosinas' | 'Fiambrería' | 'Panadería' | 'Verdulería' | 'Otros';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'fiado';
export type Unit = 'unidad' | 'kg' | 'litro';

export const ALL_CATEGORIES: Category[] = ['Bebidas', 'Lácteos', 'Almacén', 'Limpieza', 'Golosinas', 'Fiambrería', 'Panadería', 'Verdulería', 'Otros'];

export interface Product {
  id: string;
  name: string;
  category: Category;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unit: Unit;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  clientId?: string;
}

export interface ClientPurchase {
  date: string;
  amount: number;
  detail: string;
}

export interface ClientPayment {
  date: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  debt: number;
  purchases: ClientPurchase[];
  payments: ClientPayment[];
}

export interface StockMovement {
  id: string;
  productId: string;
  date: string;
  type: 'venta' | 'ajuste' | 'ingreso';
  quantity: number;
  reason?: string;
}

export interface DailySummary {
  date: string;
  label: string;
  total: number;
  count: number;
  profit: number;
}

export const initialProducts: Product[] = [
  { id: 'p1', name: 'Coca-Cola 1.5L', category: 'Bebidas', costPrice: 1200, sellPrice: 1800, stock: 24, minStock: 6, unit: 'unidad' },
  { id: 'p2', name: 'Leche La Serenísima 1L', category: 'Lácteos', costPrice: 850, sellPrice: 1200, stock: 12, minStock: 5, unit: 'unidad' },
  { id: 'p3', name: 'Fideos Matarazzo 500g', category: 'Almacén', costPrice: 600, sellPrice: 950, stock: 30, minStock: 8, unit: 'unidad' },
  { id: 'p4', name: 'Lavandina Ayudín 1L', category: 'Limpieza', costPrice: 400, sellPrice: 700, stock: 8, minStock: 4, unit: 'unidad' },
  { id: 'p5', name: 'Alfajor Havanna', category: 'Golosinas', costPrice: 500, sellPrice: 900, stock: 3, minStock: 5, unit: 'unidad' },
  { id: 'p6', name: 'Jamón cocido', category: 'Fiambrería', costPrice: 4500, sellPrice: 7200, stock: 5, minStock: 2, unit: 'kg' },
  { id: 'p7', name: 'Agua mineral 1.5L', category: 'Bebidas', costPrice: 500, sellPrice: 800, stock: 18, minStock: 6, unit: 'unidad' },
  { id: 'p8', name: 'Yogur Yogurísimo 1L', category: 'Lácteos', costPrice: 900, sellPrice: 1400, stock: 6, minStock: 4, unit: 'unidad' },
  { id: 'p9', name: 'Arroz Gallo 1kg', category: 'Almacén', costPrice: 800, sellPrice: 1300, stock: 15, minStock: 5, unit: 'unidad' },
  { id: 'p10', name: 'Detergente Magistral 500ml', category: 'Limpieza', costPrice: 600, sellPrice: 1000, stock: 10, minStock: 3, unit: 'unidad' },
  { id: 'p11', name: 'Caramelos Sugus x10', category: 'Golosinas', costPrice: 200, sellPrice: 400, stock: 50, minStock: 10, unit: 'unidad' },
  { id: 'p12', name: 'Queso cremoso', category: 'Fiambrería', costPrice: 3800, sellPrice: 6000, stock: 3, minStock: 2, unit: 'kg' },
  { id: 'p13', name: 'Cerveza Quilmes 1L', category: 'Bebidas', costPrice: 1000, sellPrice: 1600, stock: 20, minStock: 6, unit: 'unidad' },
  { id: 'p14', name: 'Manteca La Serenísima 200g', category: 'Lácteos', costPrice: 700, sellPrice: 1100, stock: 8, minStock: 3, unit: 'unidad' },
  { id: 'p15', name: 'Aceite Cocinero 900ml', category: 'Almacén', costPrice: 1200, sellPrice: 1900, stock: 12, minStock: 4, unit: 'unidad' },
  { id: 'p16', name: 'Jabón en polvo Skip 800g', category: 'Limpieza', costPrice: 1500, sellPrice: 2400, stock: 4, minStock: 5, unit: 'unidad' },
  { id: 'p17', name: 'Chocolate Milka 150g', category: 'Golosinas', costPrice: 800, sellPrice: 1300, stock: 7, minStock: 3, unit: 'unidad' },
  { id: 'p18', name: 'Salame', category: 'Fiambrería', costPrice: 3500, sellPrice: 5800, stock: 4, minStock: 2, unit: 'kg' },
  { id: 'p19', name: 'Fernet Branca 750ml', category: 'Bebidas', costPrice: 3000, sellPrice: 4800, stock: 6, minStock: 3, unit: 'unidad' },
  { id: 'p20', name: 'Pan lactal Bimbo', category: 'Panadería', costPrice: 900, sellPrice: 1400, stock: 10, minStock: 4, unit: 'unidad' },
];

export const initialClients: Client[] = [
  {
    id: 'c1', name: 'María González', phone: '11-2345-6789', debt: 12500,
    purchases: [
      { date: '2026-02-10', amount: 4500, detail: 'Fideos, Aceite, Leche x2' },
      { date: '2026-02-07', amount: 3200, detail: 'Queso 0.5kg, Jamón 0.3kg' },
      { date: '2026-02-03', amount: 6800, detail: 'Compra semanal' },
    ],
    payments: [
      { date: '2026-02-05', amount: 2000 },
    ],
  },
  {
    id: 'c2', name: 'Roberto Sánchez', phone: '11-3456-7890', debt: 8300,
    purchases: [
      { date: '2026-02-11', amount: 3100, detail: 'Cerveza x2, Fernet' },
      { date: '2026-02-08', amount: 5200, detail: 'Compra variada' },
    ],
    payments: [],
  },
  {
    id: 'c3', name: 'Ana López', phone: '11-4567-8901', debt: 3200,
    purchases: [
      { date: '2026-02-09', amount: 3200, detail: 'Leche, Yogur, Pan, Manteca' },
    ],
    payments: [],
  },
  {
    id: 'c4', name: 'Carlos Ruiz', phone: '11-5678-9012', debt: 1800,
    purchases: [
      { date: '2026-02-11', amount: 1800, detail: 'Coca-Cola, Alfajores x3' },
    ],
    payments: [],
  },
];

// Generate deterministic daily summaries for the last 30 days
export function generateDailySummaries(): DailySummary[] {
  const days: DailySummary[] = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const base = dow === 0 ? 22000 : dow === 6 ? 52000 : 43000;
    const variation = Math.sin(i * 1.7) * 0.25 + 1;
    const total = Math.round(base * variation);
    const count = Math.round(total / 3800);
    days.push({
      date: d.toISOString().split('T')[0],
      label: `${dayNames[dow]} ${d.getDate()}/${d.getMonth() + 1}`,
      total,
      count,
      profit: Math.round(total * 0.33),
    });
  }
  return days;
}

// Today's detailed sales
export const todaySales: Sale[] = [
  { id: 's1', date: new Date().toISOString(), items: [{ productId: 'p1', productName: 'Coca-Cola 1.5L', quantity: 2, unitPrice: 1800, subtotal: 3600 }, { productId: 'p3', productName: 'Fideos Matarazzo 500g', quantity: 1, unitPrice: 950, subtotal: 950 }], total: 4550, paymentMethod: 'efectivo' },
  { id: 's2', date: new Date().toISOString(), items: [{ productId: 'p2', productName: 'Leche La Serenísima 1L', quantity: 3, unitPrice: 1200, subtotal: 3600 }], total: 3600, paymentMethod: 'transferencia' },
  { id: 's3', date: new Date().toISOString(), items: [{ productId: 'p6', productName: 'Jamón cocido', quantity: 0.5, unitPrice: 7200, subtotal: 3600 }, { productId: 'p12', productName: 'Queso cremoso', quantity: 0.3, unitPrice: 6000, subtotal: 1800 }], total: 5400, paymentMethod: 'efectivo' },
  { id: 's4', date: new Date().toISOString(), items: [{ productId: 'p13', productName: 'Cerveza Quilmes 1L', quantity: 3, unitPrice: 1600, subtotal: 4800 }, { productId: 'p19', productName: 'Fernet Branca 750ml', quantity: 1, unitPrice: 4800, subtotal: 4800 }], total: 9600, paymentMethod: 'tarjeta' },
  { id: 's5', date: new Date().toISOString(), items: [{ productId: 'p9', productName: 'Arroz Gallo 1kg', quantity: 2, unitPrice: 1300, subtotal: 2600 }, { productId: 'p15', productName: 'Aceite Cocinero 900ml', quantity: 1, unitPrice: 1900, subtotal: 1900 }], total: 4500, paymentMethod: 'efectivo' },
  { id: 's6', date: new Date().toISOString(), items: [{ productId: 'p5', productName: 'Alfajor Havanna', quantity: 2, unitPrice: 900, subtotal: 1800 }], total: 1800, paymentMethod: 'fiado', clientId: 'c4' },
  { id: 's7', date: new Date().toISOString(), items: [{ productId: 'p20', productName: 'Pan lactal Bimbo', quantity: 1, unitPrice: 1400, subtotal: 1400 }, { productId: 'p14', productName: 'Manteca La Serenísima 200g', quantity: 1, unitPrice: 1100, subtotal: 1100 }, { productId: 'p8', productName: 'Yogur Yogurísimo 1L', quantity: 2, unitPrice: 1400, subtotal: 2800 }], total: 5300, paymentMethod: 'transferencia' },
  { id: 's8', date: new Date().toISOString(), items: [{ productId: 'p4', productName: 'Lavandina Ayudín 1L', quantity: 1, unitPrice: 700, subtotal: 700 }, { productId: 'p10', productName: 'Detergente Magistral 500ml', quantity: 1, unitPrice: 1000, subtotal: 1000 }, { productId: 'p16', productName: 'Jabón en polvo Skip 800g', quantity: 1, unitPrice: 2400, subtotal: 2400 }], total: 4100, paymentMethod: 'efectivo' },
  { id: 's9', date: new Date().toISOString(), items: [{ productId: 'p17', productName: 'Chocolate Milka 150g', quantity: 3, unitPrice: 1300, subtotal: 3900 }, { productId: 'p11', productName: 'Caramelos Sugus x10', quantity: 5, unitPrice: 400, subtotal: 2000 }], total: 5900, paymentMethod: 'tarjeta' },
  { id: 's10', date: new Date().toISOString(), items: [{ productId: 'p7', productName: 'Agua mineral 1.5L', quantity: 4, unitPrice: 800, subtotal: 3200 }, { productId: 'p1', productName: 'Coca-Cola 1.5L', quantity: 2, unitPrice: 1800, subtotal: 3600 }], total: 6800, paymentMethod: 'efectivo' },
];

export const initialStockMovements: StockMovement[] = [
  { id: 'sm1', productId: 'p1', date: '2026-02-11', type: 'ingreso', quantity: 24, reason: 'Llegó mercadería' },
  { id: 'sm2', productId: 'p5', date: '2026-02-10', type: 'venta', quantity: -2, reason: 'Venta' },
  { id: 'sm3', productId: 'p16', date: '2026-02-09', type: 'ajuste', quantity: -1, reason: 'Se rompió una caja' },
  { id: 'sm4', productId: 'p2', date: '2026-02-10', type: 'ingreso', quantity: 12, reason: 'Reposición' },
  { id: 'sm5', productId: 'p12', date: '2026-02-08', type: 'venta', quantity: -2, reason: 'Venta' },
];
