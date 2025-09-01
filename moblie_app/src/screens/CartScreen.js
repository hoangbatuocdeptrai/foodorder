import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import { getImageUrl } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyVND } from '../utils/format';

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  // Format currency
  const formatCurrency = (amount) => formatCurrencyVND(amount);
  
  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        'Sign in Required',
        'You need to sign in before proceeding to checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth') },
        ]
      );
      return;
    }
    
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some products first.');
      return;
    }
    
    // Navigate to checkout screen
    navigation.navigate('Checkout');
  };
  
  // Increase item quantity
  const increaseQuantity = (item) => {
    updateQuantity(item.product.id, item.quantity + 1);
  };
  
  // Decrease item quantity
  const decreaseQuantity = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.product.id, item.quantity - 1);
    } else {
      // Confirm removal when quantity is 1
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Are you sure you want to remove this item from your cart?');
        if (confirmed) {
          removeFromCart(item.product.id);
        }
      } else {
        Alert.alert(
          'Remove Item',
          'Are you sure you want to remove this item from your cart?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', onPress: () => removeFromCart(item.product.id) },
          ]
        );
      }
    }
  };
  
  // Clear entire cart
  const handleClearCart = () => {
    if (cart.length > 0) {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('Are you sure you want to remove all items from your cart?');
        if (confirmed) {
          clearCart();
        }
      } else {
        Alert.alert(
          'Clear Cart',
          'Are you sure you want to remove all items from your cart?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', onPress: () => clearCart() },
          ]
        );
      }
    }
  };
  
  // Render empty cart
  const renderEmptyCart = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ddd" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add items to your cart to get started</Text>
        <Button 
          title="Start Shopping" 
          onPress={() => navigation.navigate('Home')}
          style={styles.shopButton}
        />
      </View>
    );
  };
  
  // Render cart item
  const renderCartItem = ({ item }) => {
    const { product, quantity } = item;
    
    return (
      <View style={styles.cartItem}>
        <Image 
          source={{ uri: getImageUrl(product.image_url) || 'https://via.placeholder.com/100' }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.category_name || 'Uncategorized'}</Text>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => decreaseQuantity(item)}
            >
              <Ionicons name="remove" size={16} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => increaseQuantity(item)}
            >
              <Ionicons name="add" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => {
            if (Platform.OS === 'web') {
              const confirmed = window.confirm('Are you sure you want to remove this item?');
              if (confirmed) {
                removeFromCart(product.id);
              }
            } else {
              removeFromCart(product.id);
            }
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#FF4C29" />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        
        {cart.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={cart}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={renderCartItem}
        ListEmptyComponent={renderEmptyCart}
        contentContainerStyle={cart.length === 0 ? styles.emptyList : styles.list}
      />
      
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(getTotalPrice())}</Text>
          </View>
          
          <Button title="Checkout" onPress={handleCheckout} />
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    fontSize: 14,
    color: '#FF4C29',
  },
  list: {
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4C29',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    width: '70%',
  },
}); 