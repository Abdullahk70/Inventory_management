import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Product } from '../types';

export const productService = {
  async addProduct(userId: string, name: string, quantity: number, purchasePrice: number, description?: string) {
    try {
      const priceArray = Array(quantity).fill(purchasePrice);
      const productData: any = {
        name,
        quantity,
        purchasePrices: priceArray,
        salePrices: [],
        createdAt: Timestamp.now(),
        userId
      };
      
      if (description) {
        productData.description = description;
      }
      
      const productRef = await addDoc(collection(db, 'products'), productData);
      
      await addDoc(collection(db, 'transactions'), {
        productId: productRef.id,
        type: 'purchase',
        price: purchasePrice,
        quantity,
        date: Timestamp.now(),
        userId
      });
      
      return productRef;
    } catch (error: any) {
      console.error('Add product error:', error);
      throw new Error(error.message || 'Failed to add product');
    }
  },

  async updateProduct(productId: string, data: Partial<Product>) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, data);
    } catch (error: any) {
      console.error('Update product error:', error);
      throw new Error(error.message || 'Failed to update product');
    }
  },

  async deleteProduct(productId: string) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error: any) {
      console.error('Delete product error:', error);
      throw new Error(error.message || 'Failed to delete product');
    }
  },

  async getProducts(userId: string) {
    try {
      const q = query(collection(db, 'products'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error: any) {
      console.error('Get products error:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  },

  subscribeToProducts(userId: string, callback: (products: Product[]) => void) {
    try {
      const q = query(collection(db, 'products'), where('userId', '==', userId));
      return onSnapshot(q, 
        (snapshot) => {
          const products = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() 
          } as Product));
          callback(products);
        },
        (error) => {
          console.error('Products subscription error:', error);
        }
      );
    } catch (error: any) {
      console.error('Subscribe to products error:', error);
      return () => {};
    }
  }
};
