import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Animated, Dimensions, Platform, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { router } from 'expo-router';
import { calculateAveragePurchasePrice, calculateAverageSalePrice } from '../../utils/calculations';
import { LinearGradient } from 'expo-linear-gradient';
import Sidebar from '../../components/Sidebar';

const isWeb = Platform.OS === 'web';

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = productService.subscribeToProducts(user.uid, (data) => {
      setProducts(data);
      setFilteredProducts(data);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredProducts(
        products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleDelete = (productId: string, productName: string) => {
    if (isWeb) {
      if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        productService.deleteProduct(productId)
          .then(() => {
            alert(`${productName} has been removed from your inventory.`);
          })
          .catch((error: any) => {
            console.error('Delete product error:', error);
            alert(error.message || 'Failed to delete product. Please try again.');
          });
      }
    } else {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await productService.deleteProduct(productId);
                Alert.alert(
                  'Deleted', 
                  `${productName} has been removed from your inventory.`,
                  [{ text: 'OK', style: 'default' }]
                );
              } catch (error: any) {
                console.error('Delete product error:', error);
                Alert.alert(
                  'Error', 
                  error.message || 'Failed to delete product. Please try again.',
                  [{ text: 'OK', style: 'default' }]
                );
              }
            }
          }
        ]
      );
    }
  };

  const styles = getStyles(isDark, isMobile, isTablet);

  const renderProduct = ({ item }: { item: Product }) => {
    const avgPurchase = calculateAveragePurchasePrice(item.purchasePrices);
    const avgSale = calculateAverageSalePrice(item.salePrices);
    const totalValue = item.quantity * avgPurchase;
    const isLowStock = item.quantity <= 10;

    return (
      <View style={styles.productCard}>
        <LinearGradient
          colors={isDark ? ['#111111', '#1a1a1a'] : ['#ffffff', '#fafbfc']}
          style={styles.cardGradient}
        >
          {/* Compact Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.productIconBox}>
                <Text style={styles.productIcon}>📦</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productSku}>#{item.id.slice(0, 6).toUpperCase()}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, isLowStock && styles.statusBadgeLow]}>
              <View style={[styles.statusDot, isLowStock && styles.statusDotLow]} />
            </View>
          </View>

          {/* Description */}
          {item.description ? (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Compact Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.quantity}</Text>
              <Text style={styles.statLabel}>Stock</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>£{avgPurchase.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Buy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>£{avgSale.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Sell</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>£{totalValue.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Value</Text>
            </View>
          </View>

          {/* Compact Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => router.push(`/products/edit?id=${item.id}`)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionIcon}>✏️</Text>
                <Text style={styles.actionText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => router.push(`/transactions/add?productId=${item.id}`)}
            >
              <View style={styles.actionSecondary}>
                <Text style={styles.actionIcon}>💰</Text>
                <Text style={styles.actionTextSecondary}>Trade</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtnSmall}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <View style={styles.actionDanger}>
                <Text style={styles.actionIcon}>🗑️</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Sidebar activeRoute="products" />

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Products</Text>
              <Text style={styles.subtitle}>{filteredProducts.length} items</Text>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/products/add')}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.addButtonGradient}
              >
                <Text style={styles.addButtonText}>+ Add Product</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {filteredProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No products found' : 'No products yet'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Try a different search term' : 'Add your first product to get started'}
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map(item => (
                <View key={item.id} style={styles.productCardWrapper}>
                  {renderProduct({ item })}
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean, isMobile: boolean, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isMobile ? 'column' : 'row',
    backgroundColor: isDark ? '#0a0a0a' : '#f8f9fa',
  },
  sidebar: {
    width: 280,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    borderRightWidth: 1,
    borderRightColor: isDark ? '#2a2a2a' : '#e9ecef',
    padding: 32,
    justifyContent: 'space-between',
    ...(isWeb && {
      '@media (max-width: 768px)': {
        display: 'none',
      },
    }),
  },
  sidebarHeader: {
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2a2a2a' : '#e9ecef',
  },
  logoIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#1a1a1a',
    letterSpacing: -0.5,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  navItemActive: {
    backgroundColor: isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 24,
  },
  navText: {
    fontSize: 15,
    color: isDark ? '#999999' : '#666666',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: isDark ? '#2a2a2a' : '#e9ecef',
    paddingTop: 20,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  themeText: {
    fontSize: 14,
    color: isDark ? '#888888' : '#666666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: isDark ? '#ff3b3020' : '#ff3b3010',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    padding: isMobile ? 24 : isTablet ? 32 : 48,
    backgroundColor: isDark ? '#0f0f0f' : '#f5f7fa',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'center',
    marginBottom: isMobile ? 24 : 32,
    gap: isMobile ? 16 : 0,
  },
  title: {
    fontSize: isMobile ? 24 : 32,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#888888' : '#666666',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: isMobile ? '100%' : 'auto',
  },
  addButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#e9ecef',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: isDark ? '#ffffff' : '#1a1a1a',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clearIcon: {
    fontSize: 18,
    color: isDark ? '#666666' : '#999999',
    padding: 4,
  },
  list: {
    paddingBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  productCardWrapper: {
    width: isMobile ? '100%' : isTablet ? '50%' : '50%',
    paddingHorizontal: 8,
  },
  productCard: {
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? '#1f1f1f' : '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: isDark ? '#667eea15' : '#667eea08',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productIcon: {
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  productSku: {
    fontSize: 11,
    color: isDark ? '#6b7280' : '#9ca3af',
    fontWeight: '500',
  },
  productDescription: {
    fontSize: 13,
    color: isDark ? '#9ca3af' : '#6b7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  statusBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: isDark ? '#10b98130' : '#10b98120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeLow: {
    backgroundColor: isDark ? '#f59e0b30' : '#f59e0b20',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusDotLow: {
    backgroundColor: '#f59e0b',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#e5e7eb',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#ffffff' : '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: isDark ? '#6b7280' : '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: isDark ? '#2a2a2a' : '#e5e7eb',
    marginHorizontal: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionBtnSmall: {
    width: 48,
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionSecondary: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
    borderWidth: 1,
    borderColor: isDark ? '#2a2a2a' : '#e5e7eb',
    borderRadius: 10,
    gap: 6,
  },
  actionDanger: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#7f1d1d15' : '#fef2f2',
    borderWidth: 1,
    borderColor: isDark ? '#7f1d1d30' : '#fecaca',
    borderRadius: 10,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#e5e7eb' : '#374151',
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
    color: isDark ? '#ffffff' : '#1a1a1a',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: isDark ? '#888888' : '#666666',
    textAlign: 'center',
  },
});
