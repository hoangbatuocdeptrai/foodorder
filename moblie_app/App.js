import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Contexts
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CategoryProducts from './src/screens/CategoryProducts';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import AdminPanelScreen from './src/screens/admin/AdminPanelScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderConfirmationScreen from './src/screens/OrderConfirmationScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';

// Stack navigator
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF4C29',
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main app component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen 
                name="AdminPanel" 
                component={AdminPanelScreen}
              />
              <Stack.Screen 
                name="CategoryProducts" 
                component={CategoryProducts} 
                options={({ route }) => ({
                  headerShown: true,
                  title: route.params?.categoryName || 'Products',
                  headerStyle: { backgroundColor: '#FF4C29' },
                  headerTintColor: '#fff',
                })}
              />
              <Stack.Screen 
                name="ProductDetail" 
                component={ProductDetailScreen} 
              />
              <Stack.Screen 
                name="Checkout" 
                component={CheckoutScreen} 
              />
              <Stack.Screen 
                name="OrderConfirmation" 
                component={OrderConfirmationScreen} 
              />
              <Stack.Screen 
                name="OrderHistory" 
                component={OrderHistoryScreen} 
              />
              <Stack.Screen 
                name="OrderDetail" 
                component={OrderDetailScreen} 
              />
              <Stack.Screen 
                name="AdminOrderDetail" 
                component={OrderDetailScreen} 
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
