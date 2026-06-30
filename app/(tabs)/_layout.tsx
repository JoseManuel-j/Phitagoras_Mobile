import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useContext } from 'react';
import { ThemeContext } from '../../components/ThemeContext'; // Mundur 2 folder

export default function TabLayout() {
  const { isDarkMode } = useContext(ThemeContext);
  
  const tabBarBg = isDarkMode ? '#1E1E2D' : '#FFFFFF';
  const borderTop = isDarkMode ? '#2D3748' : '#E2E8F0';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4F8EF7', 
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopWidth: 1,
          borderTopColor: borderTop,
          elevation: 5,
        },
        headerShown: false,
      }}>
      
      <Tabs.Screen name="beranda" options={{ title: 'Beranda', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="jadwal" options={{ title: 'Jadwal', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="pembayaran" options={{ title: 'Tagihan', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />) }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />) }} />
    </Tabs>
  );
}