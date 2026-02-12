export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}$${withDots},${decPart}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export function formatDayName(date: Date): string {
  return date.toLocaleDateString('es-AR', { weekday: 'short' });
}

export function getCategoryColorClass(category: string): string {
  const map: Record<string, string> = {
    'Bebidas': 'bg-cat-bebidas/15 text-cat-bebidas',
    'Lácteos': 'bg-cat-lacteos/15 text-cat-lacteos',
    'Almacén': 'bg-cat-almacen/15 text-cat-almacen',
    'Limpieza': 'bg-cat-limpieza/15 text-cat-limpieza',
    'Golosinas': 'bg-cat-golosinas/15 text-cat-golosinas',
    'Fiambrería': 'bg-cat-fiambreria/15 text-cat-fiambreria',
    'Panadería': 'bg-cat-panaderia/15 text-cat-panaderia',
    'Verdulería': 'bg-cat-verduleria/15 text-cat-verduleria',
    'Otros': 'bg-cat-otros/15 text-cat-otros',
  };
  return map[category] || 'bg-muted text-muted-foreground';
}

export function getStockStatus(stock: number, minStock: number): 'ok' | 'low' | 'out' {
  if (stock <= 0) return 'out';
  if (stock <= minStock) return 'low';
  return 'ok';
}

export function getStockColorClass(status: 'ok' | 'low' | 'out'): string {
  switch (status) {
    case 'ok': return 'text-success bg-success/10';
    case 'low': return 'text-warning bg-warning/10';
    case 'out': return 'text-destructive bg-destructive/10';
  }
}
