import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { transactionService } from "../../services/transactionService";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import { LinearGradient } from "expo-linear-gradient";
import Sidebar from "../../components/Sidebar";

const isWeb = Platform.OS === "web";

export default function AddTransactionScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  const { user } = useAuth();
  const { productId } = useLocalSearchParams();
  const [productName, setProductName] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"purchase" | "sale">("purchase");
  const [quantityError, setQuantityError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    const docRef = doc(db, "products", productId as string);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProductName(docSnap.data().name);
      setCurrentStock(docSnap.data().quantity);
    }
  };

  const validateQuantity = (qty: string) => {
    if (!qty) {
      setQuantityError("Quantity is required");
      return false;
    }
    const qtyNum = parseInt(qty);
    if (qtyNum <= 0) {
      setQuantityError("Quantity must be greater than 0");
      return false;
    }
    if (type === "sale" && qtyNum > currentStock) {
      setQuantityError(`Only ${currentStock} units available`);
      return false;
    }
    setQuantityError("");
    return true;
  };

  const validatePrice = (prc: string) => {
    if (!prc) {
      setPriceError("Price is required");
      return false;
    }
    if (parseFloat(prc) <= 0) {
      setPriceError("Price must be greater than 0");
      return false;
    }
    setPriceError("");
    return true;
  };

  const handleTransaction = async () => {
    const isQuantityValid = validateQuantity(quantity);
    const isPriceValid = validatePrice(price);

    if (!isQuantityValid || !isPriceValid) {
      return;
    }

    setLoading(true);
    try {
      const qty = parseInt(quantity);
      const prc = parseFloat(price);

      if (type === "purchase") {
        await transactionService.addPurchase(
          user!.uid,
          productId as string,
          qty,
          prc,
        );
      } else {
        await transactionService.addSale(
          user!.uid,
          productId as string,
          qty,
          prc,
        );
      }

      setSuccessMessage(
        `${type === "purchase" ? "Purchase" : "Sale"} recorded successfully!`,
      );
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error("Transaction error:", error);
      setPriceError(error.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isMobile, isTablet);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        <LinearGradient
          colors={["#f5f7fa", "#ffffff"]}
          style={styles.backgroundGradient}
        />
        <View style={styles.gridPattern} />
      </View>

      <Sidebar activeRoute="transactions" />

      <ScrollView
        style={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.pageHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
              <Text style={styles.backText}>Back to Products</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Record Transaction</Text>
            <Text style={styles.pageSubtitle}>
              Add a purchase or sale for {productName}
            </Text>
          </View>

          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <View style={styles.productInfoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Product</Text>
                <Text style={styles.infoValue}>{productName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Stock</Text>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockBadgeText}>
                    {currentStock} units
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === "purchase" && styles.typeButtonActivePurchase,
                ]}
                onPress={() => setType("purchase")}
              >
                <Text style={styles.typeIcon}>🛒</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    type === "purchase" && styles.typeButtonTextActive,
                  ]}
                >
                  Purchase
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === "sale" && styles.typeButtonActiveSale,
                ]}
                onPress={() => setType("sale")}
              >
                <Text style={styles.typeIcon}>💰</Text>
                <Text
                  style={[
                    styles.typeButtonText,
                    type === "sale" && styles.typeButtonTextActive,
                  ]}
                >
                  Sale
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  quantityError && styles.inputWrapperError,
                ]}
              >
                <Text style={styles.inputIcon}>📦</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  placeholderTextColor={"#9ca3af"}
                  value={quantity}
                  onChangeText={(text) => {
                    setQuantity(text.replace(/[^0-9]/g, ""));
                    if (quantityError) validateQuantity(text);
                  }}
                  onBlur={() => validateQuantity(quantity)}
                  keyboardType="numeric"
                  {...(isWeb && { outlineStyle: "none" })}
                />
              </View>
              {quantityError ? (
                <Text style={styles.errorText}>{quantityError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {type === "purchase" ? "Purchase Price" : "Selling Price"} *
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  priceError && styles.inputWrapperError,
                ]}
              >
                <Text style={styles.inputIcon}>💵</Text>
                <Text style={styles.currencyPrefix}>£</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 8 }]}
                  placeholder="0.00"
                  placeholderTextColor={"#9ca3af"}
                  value={price}
                  onChangeText={(text) => {
                    setPrice(text.replace(/[^0-9.]/g, ""));
                    if (priceError) validatePrice(text);
                  }}
                  onBlur={() => validatePrice(price)}
                  keyboardType="decimal-pad"
                  {...(isWeb && { outlineStyle: "none" })}
                />
              </View>
              {priceError ? (
                <Text style={styles.errorText}>{priceError}</Text>
              ) : null}
            </View>

            {quantity && price && (
              <View style={styles.summarySection}>
                <LinearGradient
                  colors={
                    type === "purchase"
                      ? ["#f59e0b08", "#f59e0b15"]
                      : ["#10b98108", "#10b98115"]
                  }
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
                    <Text style={styles.summaryValue}>
                      £{parseFloat(price).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelBold}>Total Amount</Text>
                    <Text
                      style={[
                        styles.summaryValueBold,
                        { color: type === "purchase" ? "#f59e0b" : "#10b981" },
                      ]}
                    >
                      £
                      {(
                        parseInt(quantity || "0") * parseFloat(price || "0")
                      ).toFixed(2)}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleTransaction}
                disabled={loading}
              >
                <LinearGradient
                  colors={
                    type === "purchase"
                      ? ["#f59e0b", "#d97706"]
                      : ["#10b981", "#059669"]
                  }
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitText}>
                    {loading
                      ? "Recording..."
                      : `✓ Record ${type === "purchase" ? "Purchase" : "Sale"}`}
                  </Text>
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

const getStyles = (isMobile: boolean, isTablet: boolean): any =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isMobile ? "column" : "row",
      backgroundColor: "#f5f7fa",
      minHeight: "100vh" as any,
    },
    backgroundPattern: {
      position: "absolute",
      top: 0,
      left: isMobile ? 0 : 280,
      right: 0,
      bottom: 0,
      overflow: "hidden",
    },
    backgroundGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    gridPattern: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      opacity: 0.3,
    },
    mainContent: {
      flex: 1,
      backgroundColor: "transparent",
    },
    content: {
      padding: isMobile ? 24 : isTablet ? 32 : 48,
      paddingTop: isMobile ? 24 : 32,
      paddingBottom: isMobile ? 24 : 32,
      maxWidth: 700,
      marginHorizontal: "auto",
      width: "100%",
    },
    pageHeader: {
      marginBottom: 24,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      cursor: "pointer",
    },
    backIcon: {
      fontSize: 20,
      color: "#667eea",
      marginRight: 8,
    },
    backText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#667eea",
    },
    pageTitle: {
      fontSize: isMobile ? 24 : 28,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    pageSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      fontWeight: "500",
    },
    successBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#10b98108",
      borderLeftWidth: 4,
      borderLeftColor: "#10b981",
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
      color: "#10b981",
      fontWeight: "600",
    },
    formCard: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: isMobile ? 20 : 28,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    productInfoSection: {
      backgroundColor: "#f9fafb",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: "#6b7280",
      fontWeight: "500",
    },
    infoValue: {
      fontSize: 15,
      color: "#111827",
      fontWeight: "600",
    },
    stockBadge: {
      backgroundColor: "#667eea15",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
    },
    stockBadgeText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#667eea",
    },
    typeSelector: {
      flexDirection: isMobile ? "column" : "row",
      gap: 12,
      marginBottom: 24,
    },
    typeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderWidth: 1.5,
      borderColor: "#d1d5db",
      borderRadius: 10,
      backgroundColor: "#ffffff",
      gap: 8,
    },
    typeButtonActivePurchase: {
      backgroundColor: "#f59e0b15",
      borderColor: "#f59e0b",
    },
    typeButtonActiveSale: {
      backgroundColor: "#10b98115",
      borderColor: "#10b981",
    },
    typeIcon: {
      fontSize: 20,
    },
    typeButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#6b7280",
    },
    typeButtonTextActive: {
      color: "#111827",
    },
    inputGroup: {
      marginBottom: 18,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: "#374151",
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: "#d1d5db",
      paddingHorizontal: isMobile ? 12 : 14,
      height: isMobile ? 46 : 48,
      ...(isWeb && { outlineStyle: "none" }),
    },
    inputWrapperError: {
      borderColor: "#ef4444",
    },
    inputIcon: {
      fontSize: 18,
      marginRight: 12,
    },
    currencyPrefix: {
      fontSize: 16,
      fontWeight: "600",
      color: "#6b7280",
      marginRight: 4,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: "#111827",
      fontWeight: "500",
      ...(isWeb && { outlineStyle: "none" }),
    },
    errorText: {
      fontSize: 13,
      color: "#ef4444",
      marginTop: 6,
      fontWeight: "500",
    },
    summarySection: {
      marginBottom: 24,
    },
    summaryCard: {
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: "#e5e7eb",
      marginVertical: 6,
    },
    summaryLabel: {
      fontSize: 14,
      color: "#6b7280",
      fontWeight: "500",
    },
    summaryValue: {
      fontSize: 15,
      color: "#374151",
      fontWeight: "600",
    },
    summaryLabelBold: {
      fontSize: 15,
      color: "#111827",
      fontWeight: "700",
    },
    summaryValueBold: {
      fontSize: 18,
      fontWeight: "700",
    },
    actionButtons: {
      gap: 10,
    },
    submitButton: {
      borderRadius: 10,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    submitGradient: {
      paddingVertical: 14,
      alignItems: "center",
    },
    submitText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    cancelButton: {
      paddingVertical: 14,
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: "#f9fafb",
      borderWidth: 1,
      borderColor: "#d1d5db",
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#6b7280",
    },
  }) as any;
