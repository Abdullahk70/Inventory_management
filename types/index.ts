export interface Product {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  purchasePrices: number[];
  salePrices: number[];
  createdAt: Date;
  userId: string;
}

export interface Transaction {
  id: string;
  productId: string;
  type: 'purchase' | 'sale';
  price: number;
  quantity: number;
  date: Date;
  userId: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  totalProfit: number;
  lowStockProducts: Product[];
}
