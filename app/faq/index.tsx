import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Sidebar from '../../components/Sidebar';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const faqs: FAQItem[] = [
    {
      question: "How do I add a new product?",
      answer: "Navigate to the Products page and click the '+ Add Product' button. Fill in the product name, description (optional), quantity, and purchase price. Click 'Add Product' to save."
    },
    {
      question: "How do I record a sale or purchase?",
      answer: "Go to the Products page, find your product, and click the 'Trade' button. Select either 'Purchase' or 'Sale', enter the quantity and price, then click 'Record Purchase/Sale'."
    },
    {
      question: "What is the difference between purchase price and sale price?",
      answer: "Purchase price is what you paid to acquire the product. Sale price is what you charge customers. The system tracks all prices to calculate your profit margins automatically."
    },
    {
      question: "How is profit calculated?",
      answer: "Profit = Total Sales Revenue - Total Purchase Cost. The system automatically calculates this based on all your recorded transactions."
    },
    {
      question: "What does 'Stock Value' mean?",
      answer: "Stock Value is the total worth of your current inventory, calculated as: Quantity × Average Purchase Price for all products."
    },
    {
      question: "How do low stock alerts work?",
      answer: "When a product's quantity falls to 10 units or below, it appears in the Low Stock Alert section on the dashboard. You'll see a warning badge on the product card."
    },
    {
      question: "Can I edit a product after creating it?",
      answer: "Yes! Go to the Products page, find your product, and click the 'Edit' button. You can update the product name and other details."
    },
    {
      question: "How do I delete a product?",
      answer: "On the Products page, click the trash icon (🗑️) on the product card. You'll be asked to confirm before deletion. Note: This action cannot be undone."
    },
    {
      question: "What do the charts on the dashboard show?",
      answer: "The Sales Analytics chart shows your revenue over the last 7 days. The Revenue Overview chart compares your total sales vs purchases to visualize your business performance."
    },
    {
      question: "Can I export my data?",
      answer: "Currently, all data is stored securely in the cloud and synced in real-time. Export functionality will be added in a future update."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! All data is stored in Firebase with industry-standard encryption. Each user's data is isolated and only accessible with your login credentials."
    },
    {
      question: "Can I use this on mobile devices?",
      answer: "Absolutely! The app is fully responsive and works on desktop, tablet, and mobile devices. You can access it from any web browser."
    },
    {
      question: "What happens if I run out of stock?",
      answer: "The system allows stock to go to zero. You'll see a low stock warning before it reaches zero. You can still record purchases to restock."
    },
    {
      question: "How do I reset my password?",
      answer: "On the login page, click 'Forgot?' next to the password field. Enter your email and you'll receive a password reset link."
    },
    {
      question: "Can multiple users access the same inventory?",
      answer: "Currently, each account has its own separate inventory. Multi-user access will be considered for future versions."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const styles = getStyles(isMobile, isTablet);

  return (
    <View style={styles.container}>
      <Sidebar activeRoute="faq" />

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[{ opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.headerIcon}>❓</Text>
              <Text style={styles.pageTitle}>Frequently Asked Questions</Text>
              <Text style={styles.pageSubtitle}>
                Find answers to common questions about using InventoryPro
              </Text>
            </LinearGradient>
          </View>

          {/* FAQ List */}
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.questionLeft}>
                    <View style={styles.questionNumber}>
                      <Text style={styles.questionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.questionText}>{faq.question}</Text>
                  </View>
                  <Text style={[
                    styles.expandIcon,
                    expandedIndex === index && styles.expandIconRotated
                  ]}>
                    ▼
                  </Text>
                </TouchableOpacity>

                {expandedIndex === index && (
                  <View style={styles.faqAnswer}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <LinearGradient
              colors={['#f9fafb', '#ffffff']}
              style={styles.contactCard}
            >
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactTitle}>Still have questions?</Text>
              <Text style={styles.contactText}>
                Can't find the answer you're looking for? Check out our How to Use guide for detailed instructions.
              </Text>
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
  faqContainer: {
    paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
    paddingBottom: 32,
    gap: 16,
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 20 : 24,
    gap: 16,
  },
  questionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#667eea15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#667eea',
  },
  questionText: {
    fontSize: isMobile ? 15 : 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    lineHeight: 24,
  },
  expandIcon: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    paddingHorizontal: isMobile ? 20 : 24,
    paddingBottom: isMobile ? 20 : 24,
  },
  answerDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  answerText: {
    fontSize: isMobile ? 14 : 15,
    color: '#6b7280',
    lineHeight: 24,
    paddingLeft: isMobile ? 0 : 48,
  },
  contactSection: {
    paddingHorizontal: isMobile ? 24 : isTablet ? 32 : 48,
    paddingBottom: isMobile ? 32 : 48,
  },
  contactCard: {
    borderRadius: 20,
    padding: isMobile ? 32 : 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  contactIcon: {
    fontSize: isMobile ? 48 : 64,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: isMobile ? 22 : 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactText: {
    fontSize: isMobile ? 14 : 15,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 24,
  },
});
