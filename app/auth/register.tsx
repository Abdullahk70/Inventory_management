import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions, Platform, ScrollView, useWindowDimensions, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmallMobile = width < 480;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const { register } = useAuth();
  const { isDark } = useTheme();
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('At least 8 characters required');
      return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError('Include lowercase letter');
      return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError('Include uppercase letter');
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setPasswordError('Include a number');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirm: string) => {
    if (!confirm) {
      setConfirmError('Please confirm password');
      return false;
    }
    if (confirm !== password) {
      setConfirmError('Passwords do not match');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleRegister = async () => {
    setGeneralError('');
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      if (isWeb) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Success! 🎉', 
          'Your account has been created successfully!',
          [
            { 
              text: 'Get Started', 
              onPress: () => router.replace('/(tabs)'),
              style: 'default'
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setGeneralError(errorMessage);
      
      if (!isWeb) {
        Alert.alert('Registration Failed', errorMessage, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const styles = getStyles(isDark, isMobile, isSmallMobile);

  return (
    <View style={styles.container}>
      <View style={styles.splitContainer}>
        {/* Left Side - Branding */}
        {!isMobile && (
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.leftPanel}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          <Animated.View style={[styles.brandingContent, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Image 
                  source={require('../../assets/images/logo.png')} 
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.brandName}>Join InventoryPro</Text>
              <View style={styles.brandLine} />
              <Text style={styles.brandTagline}>
                Start managing your inventory efficiently with our powerful platform
              </Text>
            </View>
            
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Free to start, no credit card required</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Unlimited products & transactions</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Real-time analytics dashboard</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Secure cloud storage</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
        )}

        {/* Right Side - Register Form */}
        <ScrollView 
          style={styles.rightPanel}
          contentContainerStyle={styles.rightPanelContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.formContent, { opacity: 1, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.formHeader}>
              <Text style={styles.welcomeTitle}>Create account</Text>
              <Text style={styles.welcomeSubtitle}>Get started with your free account</Text>
            </View>

            <View style={styles.form}>
              {generalError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerIcon}>⚠️</Text>
                  <Text style={styles.errorBannerText}>{generalError}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[
                  styles.inputContainer,
                  emailFocused && styles.inputFocused,
                  emailError && styles.inputError
                ]}>
                  <Text style={styles.inputIconText}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) validateEmail(text);
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => {
                      setEmailFocused(false);
                      if (email) validateEmail(email);
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorMessage}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputFocused,
                  passwordError && styles.inputError
                ]}>
                  <Text style={styles.inputIconText}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) validatePassword(text);
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      if (password) validatePassword(password);
                    }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                
                {password.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.strengthBar,
                            passwordStrength >= bar && styles.strengthBarActive,
                            passwordStrength >= bar && passwordStrength <= 2 && styles.strengthBarWeak,
                            passwordStrength >= bar && passwordStrength === 3 && styles.strengthBarGood,
                            passwordStrength >= bar && passwordStrength === 4 && styles.strengthBarStrong,
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.strengthText}>
                      {passwordStrength === 0 && ''}
                      {passwordStrength === 1 && 'Weak password'}
                      {passwordStrength === 2 && 'Fair password'}
                      {passwordStrength === 3 && 'Good password'}
                      {passwordStrength === 4 && 'Strong password'}
                    </Text>
                  </View>
                )}

                {passwordError ? (
                  <Text style={styles.errorMessage}>{passwordError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[
                  styles.inputContainer,
                  confirmFocused && styles.inputFocused,
                  confirmError && styles.inputError
                ]}>
                  <Text style={styles.inputIconText}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmError) validateConfirmPassword(text);
                    }}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => {
                      setConfirmFocused(false);
                      if (confirmPassword) validateConfirmPassword(confirmPassword);
                    }}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {confirmError ? (
                  <Text style={styles.errorMessage}>{confirmError}</Text>
                ) : null}
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Creating account...' : 'Create account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.signupPrompt}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.signupLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean, isMobile: boolean, isSmallMobile: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
  },
  splitContainer: {
    flex: 1,
    flexDirection: isMobile ? 'column' : 'row',
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  brandingContent: {
    maxWidth: 500,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    letterSpacing: -1,
  },
  brandLine: {
    width: 60,
    height: 4,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 2,
  },
  brandTagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 28,
  },
  featuresContainer: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    color: '#ffffff',
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
  },
  rightPanelContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallMobile ? 20 : isMobile ? 24 : 60,
  },
  formContent: {
    width: '100%',
    maxWidth: isSmallMobile ? '100%' : 440,
  },
  formHeader: {
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: isSmallMobile ? 28 : 36,
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: isSmallMobile ? 14 : 16,
    color: isDark ? '#888888' : '#666666',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: isSmallMobile ? 16 : 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#2a2a2a' : '#e9ecef',
    paddingHorizontal: isSmallMobile ? 12 : 16,
    height: isSmallMobile ? 50 : 56,
  },
  inputFocused: {
    borderColor: '#667eea',
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIconText: {
    fontSize: 18,
    marginRight: 12,
    color: isDark ? '#666666' : '#999999',
  },
  input: {
    flex: 1,
    fontSize: isSmallMobile ? 14 : 16,
    color: isDark ? '#ffffff' : '#1a1a1a',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as any }),
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  strengthContainer: {
    marginTop: isSmallMobile ? 6 : 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: isDark ? '#2a2a2a' : '#e9ecef',
    borderRadius: 2,
  },
  strengthBarActive: {
    backgroundColor: '#10b981',
  },
  strengthBarWeak: {
    backgroundColor: '#ef4444',
  },
  strengthBarGood: {
    backgroundColor: '#f59e0b',
  },
  strengthBarStrong: {
    backgroundColor: '#10b981',
  },
  strengthText: {
    fontSize: 12,
    color: isDark ? '#888888' : '#666666',
  },
  errorMessage: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    height: isSmallMobile ? 50 : 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? '#2a2a2a' : '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: isDark ? '#666666' : '#999999',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: isDark ? '#888888' : '#666666',
  },
  signupLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#3d1a1a' : '#fee',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorBannerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: isDark ? '#fca5a5' : '#dc2626',
    lineHeight: 20,
  },
});
