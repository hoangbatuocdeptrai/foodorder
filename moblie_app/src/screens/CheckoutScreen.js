import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatCurrencyVND } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';
import Toast from 'react-native-toast-message';

export default function CheckoutScreen({ navigation }) {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery'); // Default to COD
  
  // Format currency
  const formatCurrency = (amount) => formatCurrencyVND(amount);
  
  // Go back to cart
  const goBack = () => {
    navigation.goBack();
  };
  
  // Place order
  const handlePlaceOrder = async () => {
    // Validate form
    if (!shippingAddress.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter your shipping address.');
      } else {
        Alert.alert('Missing Information', 'Please enter your shipping address.');
      }
      return;
    }
    
    if (!phoneNumber.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter your phone number.');
      } else {
        Alert.alert('Missing Information', 'Please enter your phone number.');
      }
      return;
    }
    
    // Prepare order data
    const orderData = {
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shipping_address: shippingAddress,
      phone_number: phoneNumber,
      payment_method: paymentMethod,
      total_amount: getTotalPrice()
    };
    
    // Submit order
    try {
      setIsLoading(true);
      const response = await createOrder(orderData);
      
      // Clear cart
      clearCart();
      
      // Show success toast or alert
      Toast.show({
        type: 'success',
        text1: 'Order Placed Successfully',
        text2: 'Your order has been placed successfully!',
        visibilityTime: 4000,
        autoHide: true,
      });
      
      // Navigate directly to order history instead of confirmation
      setTimeout(() => {
        navigation.navigate('OrderHistory');
      }, 500);
    } catch (error) {
      console.error('Error placing order:', error);
      
      if (Platform.OS === 'web') {
        alert('Failed to place your order. Please try again.');
      } else {
        Alert.alert('Order Error', error.response?.data?.message || 'Failed to place your order. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show order summary
  const renderOrderSummary = () => {
    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        {cart.map(item => (
          <View key={item.product.id} style={styles.summaryItem}>
            <Text style={styles.summaryItemName} numberOfLines={1}>
              {item.quantity} x {item.product.name}
            </Text>
            <Text style={styles.summaryItemPrice}>
              {formatCurrency(item.product.price * item.quantity)}
            </Text>
          </View>
        ))}
        
        <View style={styles.divider} />
        
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalAmount}>{formatCurrency(getTotalPrice())}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content}>
          {/* Shipping Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Address</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress}
                onChangeText={setShippingAddress}
                placeholder="Enter your full address"
                multiline
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          
          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                paymentMethod === 'cash_on_delivery' && styles.selectedPayment
              ]}
              onPress={() => setPaymentMethod('cash_on_delivery')}
            >
              <View style={styles.paymentOptionContent}>
                <Ionicons 
                  name="cash-outline" 
                  size={24} 
                  color={paymentMethod === 'cash_on_delivery' ? "#FF4C29" : "#666"} 
                />
                <View style={styles.paymentOptionText}>
                  <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentOptionDescription}>Pay when you receive your order</Text>
                </View>
              </View>
              
              {paymentMethod === 'cash_on_delivery' && (
                <Ionicons name="checkmark-circle" size={24} color="#FF4C29" />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Order Summary */}
          {renderOrderSummary()}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderButton} 
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order</Text>
          )}
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectedPayment: {
    borderColor: '#FF4C29',
    backgroundColor: '#FFF8F6',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentOptionDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  summaryContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4C29',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeOrderButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 