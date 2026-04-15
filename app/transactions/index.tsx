import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactionService';
import { Transaction } from '../../types';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Sidebar from '../../components/Sidebar';

export default function TransactionsScreen() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = transactionService.subscribeToTransactions(user.uid, setTransactions);
    return unsubscribe;
  }, [user]);

  const styles = getStyles();

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.typeContainer}>
          <View style={[
            styles.typeBadge,
            { backgroundColor: item.type === 'sale' ? '#10b98120' : '#f59e0b20' }
          ]}>
            <Text style={[
              styles.typeIcon,
              { color: item.type === 'sale' ? '#10b981' : '#f59e0b' }
            ]}>
              {item.type === 'sale' ? '💰' : '🛒'}
            </Text>
            <Text style={[
              styles.transactionType,
              { color: item.type === 'sale' ? '#10b981' : '#f59e0b' }
            ]}>
              {item.type === 'sale' ? 'Sale' : 'Purchase'}
            </Text>
          </View>
        </View>
        <Text style={styles.transactionDate}>
          {item.date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </Text>
      </View>
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity</Text>
          <Text style={styles.detailValue}>{item.quantity} units</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Unit Price</Text>
          <Text style={styles.detailValue}>£{item.price.toFixed(2)}</Text>
        </View>
        <View style={[styles.detailRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>£{(item.price * item.quantity).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Sidebar activeRoute="transactions" />

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Transactions</Text>
              <Text style={styles.subtitle}>{transactions.length} total transactions</Text>
            </View>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>Your transaction history will appear here</Text>
            </View>
          ) : (
            <FlatList
              data={transactions.sort((a, b) => b.date.getTime() - a.date.getTime())}
              renderItem={renderTransaction}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f7fa',
  },
  mainContent: {
    flex: 1,
    padding: 48,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  list: {
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  typeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: '700',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  transactionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});
