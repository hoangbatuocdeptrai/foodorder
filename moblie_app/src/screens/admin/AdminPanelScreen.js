import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import OrdersTab from './OrdersTab';
import { createStackNavigator } from '@react-navigation/stack';
import AddEditProduct from './AddEditProduct';
import AddEditCategory from './AddEditCategory';

const Tab = createMaterialTopTabNavigator();
const ProductsStack = createStackNavigator();
const CategoriesStack = createStackNavigator();
const OrdersStack = createStackNavigator();

function ProductsStackScreen() {
  return (
    <ProductsStack.Navigator>
      <ProductsStack.Screen 
        name="Products" 
        component={ProductsTab} 
        options={{ headerShown: false }}
      />
      <ProductsStack.Screen 
        name="AddEditProduct" 
        component={AddEditProduct} 
        options={({ route }) => ({
          title: route.params?.mode === 'edit' ? 'Edit Product' : 'Add New Product',
        })}
      />
    </ProductsStack.Navigator>
  );
}

function CategoriesStackScreen() {
  return (
    <CategoriesStack.Navigator>
      <CategoriesStack.Screen 
        name="Categories" 
        component={CategoriesTab} 
        options={{ headerShown: false }}
      />
      <CategoriesStack.Screen 
        name="AddEditCategory" 
        component={AddEditCategory} 
        options={({ route }) => ({
          title: route.params?.mode === 'edit' ? 'Edit Category' : 'Add New Category',
        })}
      />
    </CategoriesStack.Navigator>
  );
}

function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen 
        name="Orders" 
        component={OrdersTab} 
        options={{ headerShown: false }}
      />
    </OrdersStack.Navigator>
  );
}

export default function AdminPanelScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', or 'orders'
  const { isAdmin } = useAuth();
  
  // Check if user is admin, redirect if not
  React.useEffect(() => {
    const checkAdmin = async () => {
      const admin = await isAdmin();
      if (!admin) {
        Alert.alert('Access Denied', 'You do not have permission to access the admin panel.');
        navigation.goBack();
      }
    };
    
    checkAdmin();
  }, []);
  
  // Switch to products tab
  const showProductsTab = () => {
    setActiveTab('products');
  };
  
  // Switch to categories tab
  const showCategoriesTab = () => {
    setActiveTab('categories');
  };

  // Switch to orders tab
  const showOrdersTab = () => {
    setActiveTab('orders');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={showProductsTab}
        >
          <Ionicons 
            name="shirt" 
            size={20} 
            color={activeTab === 'products' ? '#FF4C29' : '#888'} 
            style={styles.tabIcon} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'products' && styles.activeTabText
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          onPress={showCategoriesTab}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={activeTab === 'categories' ? '#FF4C29' : '#888'} 
            style={styles.tabIcon} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'categories' && styles.activeTabText
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={showOrdersTab}
        >
          <Ionicons 
            name="receipt" 
            size={20} 
            color={activeTab === 'orders' ? '#FF4C29' : '#888'} 
            style={styles.tabIcon} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'orders' && styles.activeTabText
            ]}
          >
            Orders
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={styles.content}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#FF4C29',
            tabBarInactiveTintColor: '#666',
            tabBarIndicatorStyle: { backgroundColor: '#FF4C29' },
            tabBarLabelStyle: { fontWeight: 'bold' },
            tabBarStyle: { backgroundColor: 'white' },
          }}
        >
          <Tab.Screen name="ProductsTab" component={ProductsStackScreen} options={{ title: 'Products' }} />
          <Tab.Screen name="CategoriesTab" component={CategoriesStackScreen} options={{ title: 'Categories' }} />
          <Tab.Screen name="OrdersTab" component={OrdersStackScreen} options={{ title: 'Orders' }} />
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#FFF0EC',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#FF4C29',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
}); 