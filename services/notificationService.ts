import * as Notifications from 'expo-notifications';
import { Product } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async sendLowStockAlert(product: Product) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Low Stock Alert',
        body: `${product.name} is running low (${product.quantity} left)`,
        data: { productId: product.id },
      },
      trigger: null,
    });
  },

  async checkLowStock(products: Product[], threshold: number = 10) {
    for (const product of products) {
      if (product.quantity <= threshold) {
        await this.sendLowStockAlert(product);
      }
    }
  }
};
