import { Product, Transaction } from '../types';

export const calculateAveragePurchasePrice = (purchasePrices: number[]): number => {
  if (purchasePrices.length === 0) return 0;
  return purchasePrices.reduce((sum, price) => sum + price, 0) / purchasePrices.length;
};

export const calculateAverageSalePrice = (salePrices: number[]): number => {
  if (salePrices.length === 0) return 0;
  return salePrices.reduce((sum, price) => sum + price, 0) / salePrices.length;
};

export const calculateProfit = (products: Product[], transactions: Transaction[]): number => {
  let totalSales = 0;
  let totalPurchaseCost = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'sale') {
      totalSales += transaction.price * transaction.quantity;
    } else if (transaction.type === 'purchase') {
      totalPurchaseCost += transaction.price * transaction.quantity;
    }
  });

  return totalSales - totalPurchaseCost;
};

export const calculateStockValue = (products: Product[]): number => {
  return products.reduce((total, product) => {
    const avgPurchase = calculateAveragePurchasePrice(product.purchasePrices);
    return total + (product.quantity * avgPurchase);
  }, 0);
};

export const getLowStockProducts = (products: Product[], threshold: number = 10): Product[] => {
  return products.filter(product => product.quantity <= threshold);
};
