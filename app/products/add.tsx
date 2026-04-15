import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Animated, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Sidebar from '../../components/Sidebar';

const isWeb = Platform.OS === 'web';

export default function AddProductScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [nameError, setNameError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Product name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateQuantity = (qty: string) => {
    if (!qty) {
      setQuantityError('Quantity is required');
      return false;
    }
    if (parseInt(qty) <= 0) {
      setQuantityError('Quantity must be greater than 0');
      return false;
    }
    setQuantityError('');
    return true;
  };

  const validatePrice = (price: string) => {
    if (!price) {
      setPriceError('Purchase price is required');
      return false;
    }
    if (parseFloat(price) <= 0) {
      setPriceError('Price must be greater than 0');
      return false;
    }
    setPriceError('');
    return true;
  };

  const handleAdd = async () => {
    const isNameValid = validateName(name);
    const isQuantityValid = validateQuantity(quantity);
    const isPriceValid = validatePrice(purchasePrice);

    if (!isNameValid || !isQuantityValid || !isPriceValid) {
      return;
    }

    setLoading(true);
    try {
      await productService.addProduct(
        user!.uid,
        name.trim(),
        parseInt(quantity),
        parseFloat(purchasePrice),
        description.trim() || undefined
      );
      setSuccessMessage(`${name} added successfully!`);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Add product error:', error);
      setNameError(error.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isMobile, isTablet);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        <LinearGradient
          colors={['#f5f7fa', '#ffffff']}
          style={styles.backgroundGradient}
        />
        <View style={styles.gridPattern} />
      </View>

      <Sidebar activeRoute="products" />

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.pageHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
              <Text style={styles.backText}>Back to Products</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Add New Product</Text>
            <Text style={styles.pageSubtitle}>Create a new product entry in your inventory</Text>
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Product Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <View style={[styles.inputWrapper, nameError && styles.inputWrapperError]}>
                  <Text style={styles.inputIcon}>🏷️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter product name"
                    placeholderTextColor={'#9ca3af'}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (nameError) validateName(text);
                    }}
                    onBlur={() => validateName(name)}
                    {...(isWeb && { outlineStyle: 'none' })}
                  />
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>📝</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Brief description of the product"
                    placeholderTextColor={'#9ca3af'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    maxLength={150}
                    {...(isWeb && { outlineStyle: 'none' })}
                  />
                </View>
                <Text style={styles.charCount}>{description.length}/150</Text>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>Quantity *</Text>
                  <View style={[styles.inputWrapper, quantityError && styles.inputWrapperError]}>
                    <Text style={styles.inputIcon}>📦</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={'#9ca3af'}
                      value={quantity}
                      onChangeText={(text) => {
                        setQuantity(text.replace(/[^0-9]/g, ''));
                        if (quantityError) validateQuantity(text);
                      }}
                      onBlur={() => validateQuantity(quantity)}
                      keyboardType="numeric"
                      {...(isWeb && { outlineStyle: 'none' })}
                    />
                  </View>
                  {quantityError ? <Text style={styles.errorText}>{quantityError}</Text> : null}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.label}>Purchase Price *</Text>
                  <View style={[styles.inputWrapper, priceError && styles.inputWrapperError]}>
                    <Text style={styles.inputIcon}>💵</Text>
                    <Text style={styles.currencyPrefix}>£</Text>
                    <TextInput
                      style={[styles.input, { paddingLeft: 8 }]}
                      placeholder="0.00"
                      placeholderTextColor={'#9ca3af'}
                      value={purchasePrice}
                      onChangeText={(text) => {
                        setPurchasePrice(text.replace(/[^0-9.]/g, ''));
                        if (priceError) validatePrice(text);
                      }}
                      onBlur={() => validatePrice(purchasePrice)}
                      keyboardType="decimal-pad"
                      {...(isWeb && { outlineStyle: 'none' })}
                    />
                  </View>
                  {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
                </View>
              </View>
            </View>

            {/* Summary Section */}
            {quantity && purchasePrice && (
              <View style={styles.summarySection}>
                <LinearGradient
                  colors={['#667eea08', '#764ba208']}
                  style={styles.summaryCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Quantity</Text>
                    <Text style={styles.summaryValue}>{quantity} units</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Unit Price</Text>
                    <Text style={styles.summaryValue}>£{parseFloat(purchasePrice).toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelBold}>Total Investment</Text>
                    <Text style={styles.summaryValueBold}>
                      £{(parseInt(quantity || '0') * parseFloat(purchasePrice || '0')).toFixed(2)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.buttonDisabled]} 
                onPress={handleAdd}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitText}>{loading ? 'Adding Product...' : '✓ Add Product'}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => router.back()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
    minHeight: '100vh',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: isMobile ? 0 : 280,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    opacity: 0.3,
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: isMobile ? 24 : isTablet ? 32 : 48,
    paddingTop: isMobile ? 24 : 32,
    paddingBottom: isMobile ? 24 : 32,
    maxWidth: 800,
    marginHorizontal: 'auto',
    width: '100%',
  },
  pageHeader: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    cursor: 'pointer',
  },
  backIcon: {
    fontSize: 20,
    color: '#667eea',
    marginRight: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667eea',
  },
  pageTitle: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98108',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontSize: 15,
    color: '#10b981',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: isMobile ? 20 : 28,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: isMobile ? 'column' : 'row',
    marginHorizontal: isMobile ? 0 : -12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    paddingHorizontal: isMobile ? 12 : 14,
    height: isMobile ? 46 : 48,
    ...(isWeb && { outlineStyle: 'none' }),
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    ...(isWeb && { outlineStyle: 'none' }),
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
    fontWeight: '500',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#667eea20',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  summaryLabelBold: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  summaryValueBold: {
    fontSize: 18,
    color: '#667eea',
    fontWeight: '700',
  },
  actionButtons: {
    gap: 10,
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
});
