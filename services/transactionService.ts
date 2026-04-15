import { collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, increment, Timestamp, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Transaction } from '../types';

export const transactionService = {
  async addPurchase(userId: string, productId: string, quantity: number, price: number) {
    try {
      await addDoc(collection(db, 'transactions'), {
        productId,
        type: 'purchase',
        price,
        quantity,
        date: Timestamp.now(),
        userId
      });

      const productRef = doc(db, 'products', productId);
      const priceArray = Array(quantity).fill(price);
      await updateDoc(productRef, {
        quantity: increment(quantity),
        purchasePrices: arrayUnion(...priceArray)
      });
    } catch (error: any) {
      console.error('Add purchase error:', error);
      throw new Error(error.message || 'Failed to record purchase');
    }
  },

  async addSale(userId: string, productId: string, quantity: number, price: number) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (productDoc.exists()) {
        const currentProduct = productDoc.data();
        const newQuantity = currentProduct.quantity - quantity;
        
        await addDoc(collection(db, 'transactions'), {
          productId,
          type: 'sale',
          price,
          quantity,
          date: Timestamp.now(),
          userId
        });

        const updateData: any = {
          quantity: increment(-quantity),
          salePrices: arrayUnion(price)
        };
        
        if (newQuantity === 0) {
          updateData.purchasePrices = [];
          updateData.salePrices = [];
        }
        
        await updateDoc(productRef, updateData);
      }
    } catch (error: any) {
      console.error('Add sale error:', error);
      throw new Error(error.message || 'Failed to record sale');
    }
  },

  async getTransactions(userId: string) {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().date?.toDate()
      } as Transaction));
    } catch (error: any) {
      console.error('Get transactions error:', error);
      throw new Error(error.message || 'Failed to fetch transactions');
    }
  },

  subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void) {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      return onSnapshot(q, 
        (snapshot) => {
          const transactions = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            date: doc.data().date?.toDate() 
          } as Transaction));
          callback(transactions);
        },
        (error) => {
          console.error('Transactions subscription error:', error);
        }
      );
    } catch (error: any) {
      console.error('Subscribe to transactions error:', error);
      return () => {};
    }
  }
};
