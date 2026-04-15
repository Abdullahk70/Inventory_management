import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: isDark ? '#666' : '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          display: 'none',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/dashboard');
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cube.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/products');
          },
        }}
      />
    </Tabs>
  );
}
