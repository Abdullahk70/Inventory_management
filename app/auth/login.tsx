import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions, Platform, useWindowDimensions, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isSmallMobile = width < 480;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { login } = useAuth();
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
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    setGeneralError('');
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setGeneralError(errorMessage);
      
      if (!isWeb) {
        Alert.alert('Login Failed', errorMessage, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    console.log('Attempting to send password reset email to:', email);
    
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../../firebase.config');
      
      await sendPasswordResetEmail(auth, email);
      
      console.log('Password reset email sent successfully to:', email);
      setResetEmailSent(true);
      setGeneralError('');
      
      if (isWeb) {
        
      } else {
        Alert.alert(
          'Email Sent! ✅',
          `Password reset link has been sent to ${email}. Please check your inbox and spam folder.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setGeneralError(errorMessage);
      
      if (isWeb) {
        alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.brandName}>InventoryPro</Text>
              <View style={styles.brandLine} />
              <Text style={styles.brandTagline}>
                Streamline your inventory management with powerful analytics and real-time tracking
              </Text>
            </View>
            
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Real-time inventory tracking</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Advanced analytics & reports</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Low stock alerts</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>Purchase & sales management</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
        )}

        {/* Right Side - Login Form */}
        <View style={styles.rightPanel}>
          <Animated.View style={[styles.formContent, { opacity: 1, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.formHeader}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>Please enter your credentials to continue</Text>
            </View>

            <View style={styles.form}>
              {resetEmailSent ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successIcon}>✅</Text>
                  <Text style={styles.successText}>
                    Password reset email sent to {email}. Check your inbox!
                  </Text>
                </View>
              ) : null}

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
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotLink}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <View style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputFocused,
                  passwordError && styles.inputError
                ]}>
                  <Text style={styles.inputIconText}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
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
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorMessage}>{passwordError}</Text>
                ) : null}
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <Text style={styles.buttonText}>Signing in...</Text>
                  ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.signupPrompt}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.signupLink}>Create one</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallMobile ? 20 : isMobile ? 24 : 60,
    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#1a1a1a',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
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
  errorMessage: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
  },
  loginButton: {
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1a3d1a' : '#d1fae5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: isDark ? '#6ee7b7' : '#047857',
    lineHeight: 20,
  },
});
