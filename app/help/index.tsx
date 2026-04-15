import React from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Sidebar from '../../components/Sidebar';

interface GuideStep {
  title: string;
  description: string;
  icon: string;
  tips?: string[];
}

export default function HelpScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const gettingStarted: GuideStep[] = [
    {
      title: "Create Your Account",
      description: "Sign up with your email and password. Your data is securely stored and only accessible to you.",
      icon: "👤",
      tips: ["Use a strong password with uppercase, lowercase, and numbers", "Keep your login credentials safe"]
    },
    {
      title: "Explore the Dashboard",
      description: "After logging in, you'll see your dashboard with key metrics, charts, and low stock alerts.",
      icon: "📊",
      tips: ["Check the dashboard daily for insights", "Monitor low stock alerts to avoid stockouts"]
    },
    {
      title: "Add Your First Product",
      description: "Click 'Products' in the sidebar, then '+ Add Product'. Enter product details and initial stock.",
      icon: "📦",
      tips: ["Add a clear product name", "Include a description for better organization"]
    }
  ];

  const productManagement: GuideStep[] = [
    {
      title: "Adding Products",
      description: "Navigate to Products → Add Product. Fill in: Product Name, Description (optional), Initial Quantity, and Purchase Price.",
      icon: "➕",
      tips: ["The purchase price is what you paid for the product", "Quantity represents your initial stock"]
    },
    {
      title: "Editing Products",
      description: "Click the 'Edit' button on any product card to update its information.",
      icon: "✏️",
      tips: ["You can update product names anytime", "Changes are saved instantly"]
    },
    {
      title: "Deleting Products",
      description: "Click the trash icon (🗑️) on a product card. Confirm deletion when prompted.",
      icon: "🗑️",
      tips: ["Deletion is permanent and cannot be undone", "Consider editing instead if you need to keep history"]
    },
    {
      title: "Searching Products",
      description: "Use the search bar on the Products page to quickly find items by name.",
      icon: "🔍",
      tips: ["Search is case-insensitive", "Results update as you type"]
    }
  ];

  const transactions: GuideStep[] = [
    {
      title: "Recording Purchases",
      description: "Click 'Trade' on a product → Select 'Purchase' → Enter quantity and price → Click 'Record Purchase'.",
      icon: "🛒",
      tips: ["Purchase increases your stock", "Price is what you paid per unit", "System tracks all purchase prices for profit calculation"]
    },
    {
      title: "Recording Sales",
      description: "Click 'Trade' on a product → Select 'Sale' → Enter quantity and price → Click 'Record Sale'.",
      icon: "💰",
      tips: ["Sale decreases your stock", "Price is what you charged the customer", "Cannot sell more than available stock"]
    },
    {
      title: "Viewing Transaction History",
      description: "Go to Transactions page to see all your purchase and sale records with dates and amounts.",
      icon: "📋",
      tips: ["Transactions are sorted by date", "Each transaction shows type, quantity, and price"]
    }
  ];

  const analytics: GuideStep[] = [
    {
      title: "Understanding Metrics",
      description: "Dashboard shows: Total Products, Stock Value (inventory worth), Total Sales (revenue), and Net Profit/Loss.",
      icon: "📈",
      tips: ["Stock Value = Quantity × Average Purchase Price", "Profit = Total Sales - Total Purchase Cost"]
    },
    {
      title: "Reading Charts",
      description: "Sales Analytics shows 7-day revenue trend. Revenue Overview compares sales vs purchases.",
      icon: "📊",
      tips: ["Charts update in real-time", "Hover over data points for details", "Scroll horizontally on mobile"]
    },
    {
      title: "Low Stock Alerts",
      description: "Products with 10 or fewer units appear in the Low Stock Alert section on the dashboard.",
      icon: "⚠️",
      tips: ["Click on alerts to quickly restock", "Set up regular inventory checks"]
    }
  ];

  const styles = getStyles(isMobile, isTablet);

  const renderSection = (title: string, steps: GuideStep[], color: string) => (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { backgroundColor: color + '15' }]}>
        <View style={[styles.sectionBadge, { backgroundColor: color }]}>
          <Text style={styles.sectionBadgeText}>{steps.length}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIcon, { backgroundColor: color + '15' }]}>
                <Text style={styles.stepIconText}>{step.icon}</Text>
              </View>
              <View style={styles.stepTitleContainer}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>
            </View>
            <Text style={styles.stepDescription}>{step.description}</Text>
            {step.tips && step.tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Tips:</Text>
                {step.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Sidebar activeRoute="help" />

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.headerIcon}>📚</Text>
              <Text style={styles.pageTitle}>How to Use InventoryPro</Text>
              <Text style={styles.pageSubtitle}>
                Complete guide to managing your inventory efficiently
              </Text>
            </LinearGradient>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderSection("Getting Started", gettingStarted, "#667eea")}
            {renderSection("Product Management", productManagement, "#f59e0b")}
            {renderSection("Recording Transactions", transactions, "#10b981")}
            {renderSection("Analytics & Reports", analytics, "#8b5cf6")}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <LinearGradient
              colors={['#f9fafb', '#ffffff']}
              style={styles.footerCard}
            >
              <Text style={styles.footerIcon}>🎯</Text>
              <Text style={styles.footerTitle}>Pro Tips</Text>
              <View style={styles.proTips}>
                <Text style={styles.proTip}>✓ Update inventory daily for accurate insights</Text>
                <Text style={styles.proTip}>✓ Use descriptive product names for easy searching</Text>
                <Text style={styles.proTip}>✓ Monitor your dashboard regularly for trends</Text>
                <Text style={styles.proTip}>✓ Act on low stock alerts promptly</Text>
                <Text style={styles.proTip}>✓ Keep track of both purchase and sale prices</Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const getStyles = (isMobile: boolean, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: isMobile ? 'column' : 'row',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh' as any,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  pageHeader: {
    padding: isMobile ? 24 : isTablet ? 32 : 48,
    paddingBottom: isMobile ? 24 : 32,
  },
  headerGradient: {
    borderRadius: 20,
    padding: isMobile ? 32 : 48,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: isMobile ? 48 : 64,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: isMobile ? 28 : 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: isMobile ? 14 : 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
    gap: isMobile ? 32 : 40,
  },
  section: {
    marginBottom: isMobile ? 24 : 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isMobile ? 16 : 20,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  sectionBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: isMobile ? 20 : 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconText: {
    fontSize: 28,
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: isMobile ? 16 : 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  stepDescription: {
    fontSize: isMobile ? 14 : 15,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  tipsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
    paddingVertical: isMobile ? 32 : 48,
  },
  footerCard: {
    borderRadius: 20,
    padding: isMobile ? 32 : 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  footerIcon: {
    fontSize: isMobile ? 48 : 64,
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: isMobile ? 22 : 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  proTips: {
    gap: 12,
    width: '100%',
    maxWidth: 600,
  },
  proTip: {
    fontSize: isMobile ? 14 : 15,
    color: '#6b7280',
    lineHeight: 24,
  },
});
