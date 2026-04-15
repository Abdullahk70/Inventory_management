import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { productService } from "../../services/productService";
import { transactionService } from "../../services/transactionService";
import { Product, Transaction } from "../../types";
import {
  calculateProfit,
  calculateStockValue,
  getLowStockProducts,
} from "../../utils/calculations";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Sidebar from "../../components/Sidebar";

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
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

    const unsubProducts = productService.subscribeToProducts(
      user.uid,
      (data) => {
        setProducts(data);
        setLowStock(getLowStockProducts(data));
      },
    );

    const unsubTransactions = transactionService.subscribeToTransactions(
      user.uid,
      setTransactions,
    );

    return () => {
      unsubProducts();
      unsubTransactions();
    };
  }, [user]);

  const totalProducts = products.length;
  const totalStockValue = calculateStockValue(products);
  const totalProfit = calculateProfit(products, transactions);
  const totalSales = transactions
    .filter((t) => t.type === "sale")
    .reduce((sum, t) => sum + t.price * t.quantity, 0);
  const totalPurchases = transactions
    .filter((t) => t.type === "purchase")
    .reduce((sum, t) => sum + t.price * t.quantity, 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const salesByDay = last7Days.map((day) => {
    return transactions
      .filter(
        (t) =>
          t.type === "sale" && t.date.toDateString() === day.toDateString(),
      )
      .reduce((sum, t) => sum + t.price * t.quantity, 0);
  });

  const styles = getStyles(isMobile, isTablet);

  return (
    <View style={styles.container}>
      <Sidebar activeRoute="dashboard" />

      {/* Main Content */}
      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[{ opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.email?.split("@")[0]}! 👋
              </Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View
                    style={[styles.statIconBox, { backgroundColor: "#667eea15" }]}
                  >
                    <Text style={styles.statEmoji}>📦</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>Total</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{totalProducts}</Text>
                <Text style={styles.statLabel}>Products</Text>
                <View style={styles.statFooter}>
                  <Text style={styles.statTrend}>📈 Active inventory</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View
                    style={[styles.statIconBox, { backgroundColor: "#10b98115" }]}
                  >
                    <Text style={styles.statEmoji}>💵</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>Value</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>
                  £{totalStockValue.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Stock Value</Text>
                <View style={styles.statFooter}>
                  <Text style={styles.statTrend}>💼 Total worth</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View
                    style={[styles.statIconBox, { backgroundColor: "#f59e0b15" }]}
                  >
                    <Text style={styles.statEmoji}>📈</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>Revenue</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>
                  £{totalSales.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Total Sales</Text>
                <View style={styles.statFooter}>
                  <Text style={styles.statTrend}>💰 All time</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View
                    style={[
                      styles.statIconBox,
                      {
                        backgroundColor:
                          totalProfit >= 0 ? "#10b98115" : "#ef444415",
                      },
                    ]}
                  >
                    <Text style={styles.statEmoji}>
                      {totalProfit >= 0 ? "✨" : "📉"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statBadge,
                      {
                        backgroundColor:
                          totalProfit >= 0 ? "#10b98115" : "#ef444415",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statBadgeText,
                        { color: totalProfit >= 0 ? "#10b981" : "#ef4444" },
                      ]}
                    >
                      {totalProfit >= 0 ? "Profit" : "Loss"}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.statValue,
                    { color: totalProfit >= 0 ? "#10b981" : "#ef4444" },
                  ]}
                >
                  £{Math.abs(totalProfit).toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>
                  Net {totalProfit >= 0 ? "Profit" : "Loss"}
                </Text>
                <View style={styles.statFooter}>
                  <Text style={styles.statTrend}>
                    {totalProfit >= 0 ? "🎯" : "⚠️"} Current period
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Charts Section */}
          <View style={styles.chartsSection}>
            {/* Sales Trend */}
            {salesByDay.some((v) => v > 0) && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.chartTitle}>Sales Analytics</Text>
                    <Text style={styles.chartSubtitle}>
                      Last 7 days performance
                    </Text>
                  </View>
                </View>
                <View style={styles.modernChart}>
                  {last7Days.map((day, index) => {
                    const maxSale = Math.max(...salesByDay, 1);
                    const height = (salesByDay[index] / maxSale) * 200;
                    return (
                      <View key={index} style={styles.barContainer}>
                        <View style={styles.barWrapper}>
                          <Text style={styles.barValue}>
                            {salesByDay[index] > 0 ? `£${salesByDay[index]}` : ''}
                          </Text>
                          <View style={styles.barBackground}>
                            <LinearGradient
                              colors={['#667eea', '#764ba2']}
                              style={[styles.bar, { height: Math.max(height, 4) }]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                            />
                          </View>
                        </View>
                        <Text style={styles.barLabel}>
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Revenue Overview */}
            {transactions.length > 0 && (
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View>
                    <Text style={styles.chartTitle}>Revenue Overview</Text>
                    <Text style={styles.chartSubtitle}>
                      Sales vs Purchases comparison
                    </Text>
                  </View>
                </View>
                <View style={styles.comparisonChart}>
                  <View style={styles.comparisonRow}>
                    <View style={styles.comparisonLabel}>
                      <View style={[styles.comparisonDot, { backgroundColor: '#10b981' }]} />
                      <Text style={styles.comparisonText}>Sales</Text>
                    </View>
                    <View style={styles.comparisonBarContainer}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={[
                          styles.comparisonBar,
                          { width: `${Math.min((totalSales / Math.max(totalSales, totalPurchases, 1)) * 100, 100)}%` }
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.comparisonBarText}>£{totalSales.toLocaleString()}</Text>
                      </LinearGradient>
                    </View>
                  </View>
                  <View style={styles.comparisonRow}>
                    <View style={styles.comparisonLabel}>
                      <View style={[styles.comparisonDot, { backgroundColor: '#f59e0b' }]} />
                      <Text style={styles.comparisonText}>Purchases</Text>
                    </View>
                    <View style={styles.comparisonBarContainer}>
                      <LinearGradient
                        colors={['#f59e0b', '#d97706']}
                        style={[
                          styles.comparisonBar,
                          { width: `${Math.min((totalPurchases / Math.max(totalSales, totalPurchases, 1)) * 100, 100)}%` }
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.comparisonBarText}>£{totalPurchases.toLocaleString()}</Text>
                      </LinearGradient>
                    </View>
                  </View>
                  <View style={styles.comparisonRow}>
                    <View style={styles.comparisonLabel}>
                      <View style={[styles.comparisonDot, { backgroundColor: totalProfit >= 0 ? '#667eea' : '#ef4444' }]} />
                      <Text style={styles.comparisonText}>{totalProfit >= 0 ? 'Profit' : 'Loss'}</Text>
                    </View>
                    <View style={styles.comparisonBarContainer}>
                      {Math.abs(totalProfit) > 0 && (
                        <LinearGradient
                          colors={totalProfit >= 0 ? ['#667eea', '#764ba2'] : ['#ef4444', '#dc2626']}
                          style={[
                            styles.comparisonBar,
                            { width: `${Math.min((Math.abs(totalProfit) / Math.max(totalSales, totalPurchases, 1)) * 100, 100)}%` }
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Text style={styles.comparisonBarText}>£{Math.abs(totalProfit).toLocaleString()}</Text>
                        </LinearGradient>
                      )}
                      {Math.abs(totalProfit) === 0 && (
                        <Text style={[styles.comparisonBarText, { color: '#9ca3af', paddingLeft: 16 }]}>£0</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <View style={styles.alertSection}>
              <View style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={styles.alertTitleRow}>
                    <View style={styles.alertIconBox}>
                      <Text style={styles.alertIcon}>⚠️</Text>
                    </View>
                    <View>
                      <Text style={styles.alertTitle}>Low Stock Alert</Text>
                      <Text style={styles.alertSubtitle}>
                        {lowStock.length} products need attention
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.alertList}>
                  {lowStock.slice(0, 5).map((product, index) => (
                    <TouchableOpacity
                      key={product.id}
                      style={styles.alertItem}
                      onPress={() =>
                        router.push(`/products/edit?id=${product.id}`)
                      }
                    >
                      <View style={styles.alertItemLeft}>
                        <View style={styles.alertItemIcon}>
                          <Text style={styles.alertItemEmoji}>📦</Text>
                        </View>
                        <View>
                          <Text style={styles.alertItemName}>
                            {product.name}
                          </Text>
                          <Text style={styles.alertItemCategory}>
                            SKU: {product.id.slice(0, 8)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.alertItemRight}>
                        <View style={styles.stockBadge}>
                          <Text style={styles.stockBadgeText}>
                            {product.quantity} left
                          </Text>
                        </View>
                        <Text style={styles.alertArrow}>→</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Empty State */}
          {products.length === 0 && (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={["#ffffff", "#f9fafb"]}
                style={styles.emptyCard}
              >
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>
                  Start Your Inventory Journey
                </Text>
                <Text style={styles.emptyText}>
                  Add your first product to unlock powerful analytics and
                  insights
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/products/add")}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.emptyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.emptyButtonText}>
                      + Add Your First Product
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isMobile: boolean, isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isMobile ? "column" : "row",
      backgroundColor: "#f5f7fa",
      minHeight: "100vh" as any,
    },
    mainContent: {
      flex: 1,
      backgroundColor: "#f5f7fa",
    },
    pageHeader: {
      padding: isMobile ? 24 : isTablet ? 32 : 48,
      paddingBottom: isMobile ? 16 : 32,
    },
    welcomeText: {
      fontSize: isMobile ? 24 : 32,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    dateText: {
      fontSize: isMobile ? 13 : 15,
      color: "#9ca3af",
      fontWeight: "500",
    },
    statsContainer: {
      paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
      marginBottom: isMobile ? 24 : 32,
    },
    statsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: isMobile ? -6 : -10,
      marginVertical: isMobile ? -6 : 0,
    },
    statCard: {
      width: isMobile ? "calc(50% - 12px)" : isTablet ? "calc(50% - 20px)" : "calc(25% - 20px)",
      marginHorizontal: isMobile ? 6 : 10,
      marginVertical: isMobile ? 6 : 0,
      backgroundColor: "#ffffff",
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 16 : 24,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    statIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    statEmoji: {
      fontSize: 24,
    },
    statBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: "#f3f4f6",
    },
    statBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: isMobile ? 28 : 36,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 4,
      letterSpacing: -1,
    },
    statLabel: {
      fontSize: 14,
      color: "#9ca3af",
      fontWeight: "500",
      marginBottom: 12,
    },
    statFooter: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "#f3f4f6",
    },
    statTrend: {
      fontSize: 13,
      color: "#9ca3af",
      fontWeight: "500",
    },
    chartsSection: {
      paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
      gap: isMobile ? 16 : 24,
    },
    chartCard: {
      backgroundColor: "#ffffff",
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 20 : 32,
      marginBottom: isMobile ? 16 : 24,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    chartHeader: {
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "flex-start" : "flex-start",
      marginBottom: isMobile ? 16 : 24,
      gap: isMobile ? 12 : 0,
    },
    chartTitle: {
      fontSize: isMobile ? 18 : 20,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    chartSubtitle: {
      fontSize: 14,
      color: "#9ca3af",
      fontWeight: "500",
    },
    modernChart: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: 240,
      paddingTop: 20,
      gap: isMobile ? 8 : 12,
    },
    barContainer: {
      flex: 1,
      alignItems: "center",
      gap: 8,
    },
    barWrapper: {
      flex: 1,
      width: "100%",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    barValue: {
      fontSize: isMobile ? 11 : 12,
      fontWeight: "600",
      color: "#667eea",
      marginBottom: 8,
    },
    barBackground: {
      width: "100%",
      height: 200,
      backgroundColor: "#f3f4f6",
      borderRadius: 8,
      overflow: "hidden",
      justifyContent: "flex-end",
    },
    bar: {
      width: "100%",
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    barLabel: {
      fontSize: isMobile ? 11 : 12,
      fontWeight: "600",
      color: "#6b7280",
      textAlign: "center",
    },
    comparisonChart: {
      gap: 20,
    },
    comparisonRow: {
      gap: 12,
    },
    comparisonLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    comparisonDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    comparisonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#111827",
    },
    comparisonBarContainer: {
      height: 48,
      backgroundColor: "#f3f4f6",
      borderRadius: 12,
      overflow: "hidden",
    },
    comparisonBar: {
      height: "100%",
      justifyContent: "center",
      paddingHorizontal: 16,
      minWidth: 80,
    },
    comparisonBarText: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "700",
      color: "#ffffff",
    },
    alertSection: {
      paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
      marginBottom: isMobile ? 24 : 32,
    },
    alertCard: {
      backgroundColor: "#ffffff",
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 20 : 32,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderLeftWidth: 4,
      borderLeftColor: "#f59e0b",
    },
    alertHeader: {
      marginBottom: 24,
    },
    alertTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    alertIconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "#f59e0b15",
      justifyContent: "center",
      alignItems: "center",
    },
    alertIcon: {
      fontSize: 24,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 4,
    },
    alertSubtitle: {
      fontSize: 14,
      color: "#9ca3af",
      fontWeight: "500",
    },
    alertList: {
      gap: 12,
    },
    alertItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#f9fafb",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    alertItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    alertItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: "#ffffff",
      justifyContent: "center",
      alignItems: "center",
    },
    alertItemEmoji: {
      fontSize: 20,
    },
    alertItemName: {
      fontSize: 15,
      fontWeight: "600",
      color: "#111827",
      marginBottom: 2,
    },
    alertItemCategory: {
      fontSize: 12,
      color: "#9ca3af",
      fontWeight: "500",
    },
    alertItemRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    stockBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: "#f59e0b15",
    },
    stockBadgeText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#f59e0b",
    },
    alertArrow: {
      fontSize: 18,
      color: "#d1d5db",
    },
    emptyState: {
      paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
      paddingVertical: isMobile ? 40 : 60,
    },
    emptyCard: {
      borderRadius: isMobile ? 20 : 24,
      padding: isMobile ? 40 : 60,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#e5e7eb",
      borderStyle: "dashed",
    },
    emptyIcon: {
      fontSize: isMobile ? 60 : 80,
      marginBottom: isMobile ? 16 : 24,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: isMobile ? 22 : 28,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 12,
      letterSpacing: -0.5,
      textAlign: "center",
    },
    emptyText: {
      fontSize: isMobile ? 14 : 16,
      color: "#9ca3af",
      marginBottom: isMobile ? 24 : 32,
      textAlign: "center",
      maxWidth: 400,
      lineHeight: 24,
    },
    emptyButton: {
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    emptyButtonGradient: {
      paddingHorizontal: 32,
      paddingVertical: 16,
    },
    emptyButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
  }) as any;
