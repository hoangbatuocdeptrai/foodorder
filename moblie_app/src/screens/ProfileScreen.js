import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('cart');
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      } else {
        window.alert('Failed to logout. Please try again.');
      }
      try {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      } catch (innerError) {
        console.error('Forced logout failed:', innerError);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) performLogout();
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: performLogout },
      ]);
    }
  };

  // Navigate to login if not logged in
  const navigateToLogin = () => {
    navigation.navigate('Auth');
  };

  // Navigate to admin panel
  const navigateToAdminPanel = () => {
    navigation.navigate('AdminPanel');
  };

  // Navigate to order history
  const navigateToOrderHistory = () => {
    navigation.navigate('OrderHistory');
  };

  // If not logged in, show guest view
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.guestImage}
            resizeMode="contain"
          />
          <Text style={styles.guestTitle}>Sign in to your account</Text>
          <Text style={styles.guestDescription}>
            Sign in to view your profile, track orders, and access your saved items.
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
            <Text style={styles.loginButtonText}>Login or Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading indicator while logging out
  if (isLoggingOut) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4C29" />
          <Text style={styles.loadingText}>Logging out...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileInitial}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {isAdmin() && <Text style={styles.adminBadge}>Admin</Text>}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* If admin, show admin panel link */}
          {isAdmin() && (
            <TouchableOpacity style={styles.menuItem} onPress={navigateToAdminPanel}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings" size={24} color="#FF4C29" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemText}>Admin Panel</Text>
                <Text style={styles.menuItemSubtext}>Manage products and categories</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.menuItem} onPress={navigateToOrderHistory}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="receipt-outline" size={24} color="#FF4C29" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Order History</Text>
              <Text style={styles.menuItemSubtext}>View your past orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person" size={24} color="#FF4C29" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Account Details</Text>
              <Text style={styles.menuItemSubtext}>Update your profile information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="location" size={24} color="#FF4C29" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Shipping Addresses</Text>
              <Text style={styles.menuItemSubtext}>Manage your shipping addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={handleLogout}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="log-out" size={24} color="#FF4C29" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemText}>Logout</Text>
              <Text style={styles.menuItemSubtext}>Sign out from your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4C29',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  adminBadge: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#FF4C29',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  menuContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  guestDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
}); 