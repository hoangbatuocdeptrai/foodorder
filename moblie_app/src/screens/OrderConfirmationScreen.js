import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { orderId } = route.params;
  
  // Navigate to home
  const goToHome = () => {
    navigation.navigate('Home');
  };
  
  // Navigate to order details or history
  const viewOrder = () => {
    navigation.navigate('OrderHistory');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Order Confirmed!</Text>
        
        <Text style={styles.message}>
          Your order #{orderId} has been placed successfully. We will process it shortly.
        </Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Payment Method: Cash on Delivery</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              You'll receive an email confirmation with order details
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.outlineButton]}
          onPress={viewOrder}
        >
          <Text style={styles.outlineButtonText}>View Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={goToHome}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    color: '#555',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#FF4C29',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF4C29',
  },
  outlineButtonText: {
    color: '#FF4C29',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 