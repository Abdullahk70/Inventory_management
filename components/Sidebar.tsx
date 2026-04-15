import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeRoute: 'dashboard' | 'products' | 'transactions' | 'faq' | 'help';
}

export default function Sidebar({ activeRoute }: SidebarProps) {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const styles = getStyles(isMobile);

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <TouchableOpacity 
          style={styles.mobileMenuButton}
          onPress={() => setMenuOpen(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {/* Mobile Menu Modal */}
        <Modal
          visible={menuOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.mobileMenu}>
              <View style={styles.mobileMenuHeader}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../assets/images/logo.png')} 
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.brandName}>InventoryPro</Text>
                </View>
                <TouchableOpacity onPress={() => setMenuOpen(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.navSection}>
                <TouchableOpacity 
                  style={[styles.navItem, activeRoute === 'dashboard' && styles.navItemActive]}
                  onPress={() => {
                    router.push('/dashboard');
                    setMenuOpen(false);
                  }}
                >
                  <Text style={[styles.navText, activeRoute === 'dashboard' && styles.navTextActive]}>
                    Dashboard
                  </Text>
                  {activeRoute === 'dashboard' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.navItem, activeRoute === 'products' && styles.navItemActive]}
                  onPress={() => {
                    router.push('/products');
                    setMenuOpen(false);
                  }}
                >
                  <Text style={[styles.navText, activeRoute === 'products' && styles.navTextActive]}>
                    Products
                  </Text>
                  {activeRoute === 'products' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.navItem, activeRoute === 'transactions' && styles.navItemActive]}
                  onPress={() => {
                    router.push('/transactions');
                    setMenuOpen(false);
                  }}
                >
                  <Text style={[styles.navText, activeRoute === 'transactions' && styles.navTextActive]}>
                    Transactions
                  </Text>
                  {activeRoute === 'transactions' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.navItem, activeRoute === 'faq' && styles.navItemActive]}
                  onPress={() => {
                    router.push('/faq');
                    setMenuOpen(false);
                  }}
                >
                  <Text style={[styles.navText, activeRoute === 'faq' && styles.navTextActive]}>
                    FAQ
                  </Text>
                  {activeRoute === 'faq' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.navItem, activeRoute === 'help' && styles.navItemActive]}
                  onPress={() => {
                    router.push('/help');
                    setMenuOpen(false);
                  }}
                >
                  <Text style={[styles.navText, activeRoute === 'help' && styles.navTextActive]}>
                    How to Use
                  </Text>
                  {activeRoute === 'help' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <View style={styles.userSection}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user?.email?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user?.email?.split('@')[0]}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user?.email}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.logoutBtn} 
                  onPress={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <Text style={styles.logoutBtnText}>Sign out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>InventoryPro</Text>
        </View>
      </View>

      <View style={styles.navSection}>
        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'dashboard' && styles.navItemActive]}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={[styles.navText, activeRoute === 'dashboard' && styles.navTextActive]}>
            Dashboard
          </Text>
          {activeRoute === 'dashboard' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'products' && styles.navItemActive]}
          onPress={() => router.push('/products')}
        >
          <Text style={[styles.navText, activeRoute === 'products' && styles.navTextActive]}>
            Products
          </Text>
          {activeRoute === 'products' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'transactions' && styles.navItemActive]}
          onPress={() => router.push('/transactions')}
        >
          <Text style={[styles.navText, activeRoute === 'transactions' && styles.navTextActive]}>
            Transactions
          </Text>
          {activeRoute === 'transactions' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'faq' && styles.navItemActive]}
          onPress={() => router.push('/faq')}
        >
          <Text style={[styles.navText, activeRoute === 'faq' && styles.navTextActive]}>
            FAQ
          </Text>
          {activeRoute === 'faq' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeRoute === 'help' && styles.navItemActive]}
          onPress={() => router.push('/help')}
        >
          <Text style={[styles.navText, activeRoute === 'help' && styles.navTextActive]}>
            How to Use
          </Text>
          {activeRoute === 'help' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.email?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.email?.split('@')[0]}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isMobile: boolean) => StyleSheet.create({
  mobileMenuButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mobileMenu: {
    width: '80%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: '#2c3e50',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  closeButton: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#2c3e50',
    borderRightWidth: 1,
    borderRightColor: '#34495e',
    display: 'flex',
    flexDirection: 'column',
  },
  logoSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  navSection: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d1d5db',
  },
  navTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#34495e',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#34495e',
    borderRadius: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 11,
    color: '#9ca3af',
  },
  logoutBtn: {
    height: 36,
    borderRadius: 6,
    backgroundColor: '#34495e',
    borderWidth: 1,
    borderColor: '#3d5266',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#e5e7eb',
  },
});
