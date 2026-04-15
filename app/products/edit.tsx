import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated, useWindowDimensions, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { LinearGradient } from 'expo-linear-gradient';
import Sidebar from '../../components/Sidebar';

const isWeb = Platform.OS === 'web';

export default function EditProductScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [nameError, setNameError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const docRef = doc(db, 'products', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setDescription(data.description || '');
        setQuantity(data.quantity?.toString() || '0');
      }
    } catch (error) {
      console.error('Load product error:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (parseInt(qty) < 0) {
      setQuantityError('Quantity cannot be negative');
      return false;
    }
    setQuantityError('');
    return true;
  };

  const handleUpdate = async () => {
    const isNameValid = validateName(name);
    const isQuantityValid = validateQuantity(quantity);

    if (!isNameValid || !isQuantityValid) {
      return;
    }

    setSaving(true);
    try {
      await productService.updateProduct(id as string, { 
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: parseInt(quantity)
      });
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Update product error:', error);
      setNameError(error.message || 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const styles = getStyles(isMobile, isTablet);

  if (loading) {
    return (
      <View style={styles.container}>
        <Sidebar activeRoute="products" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </View>
    );
  }

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
          <View style={styles.pageHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
              <Text style={styles.backText}>Back to Products</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Edit Product</Text>
            <Text style={styles.pageSubtitle}>Update product information</Text>
          </View>

          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Quantity *</Text>
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
                <Text style={styles.helperText}>💡 Use transactions to record purchases/sales</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, saving && styles.buttonDisabled]} 
                onPress={handleUpdate}
                disabled={saving}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitText}>{saving ? 'Updating...' : '✓ Update Product'}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
    fontWeight: '500',
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
