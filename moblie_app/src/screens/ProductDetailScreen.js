import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api/config';
import { formatCurrencyVND } from '../utils/format';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart, cart } = useCart();
  
  // Check if product is already in cart
  const getCartQuantity = () => {
    const cartItem = cart.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };
  
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);
  
  // Format currency
  const formatCurrency = (amount) => formatCurrencyVND(amount);
  
  // Handle quantity change
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert('Maximum Stock', `Sorry, only ${product.stock} items available.`);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Add to cart
  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Added to Cart',
      `${quantity} x ${product.name} added to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };
  
  // Go to cart
  const goToCart = () => {
    navigation.navigate('Cart');
  };
  
  // Back button
  const goBack = () => {
    navigation.goBack();
  };
  
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4C29" />
      </View>
    );
  }
  
  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const cartItemCount = getCartQuantity();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Product Details</Text>
        
        <TouchableOpacity onPress={goToCart} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#333" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <Image 
          source={{ uri: getImageUrl(product.image_url) || 'https://via.placeholder.com/300' }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.category}>{product.category_name || 'Uncategorized'}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          
          {/* Stock Info */}
          <View style={styles.stockContainer}>
            <Ionicons 
              name={product.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={product.stock > 0 ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.stockText}>
              {product.stock > 0 
                ? `${product.stock} items in stock` 
                : 'Out of stock'}
            </Text>
          </View>
          
          {/* Quantity Selector */}
          {product.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Ionicons name="remove" size={20} color="#333" />
                </TouchableOpacity>
                
                <Text style={styles.quantity}>{quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Product Description */}
          <Text style={styles.descriptionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description || 'No description available.'}</Text>
        </View>
      </ScrollView>
      
      {/* Cart Info & Add to Cart Button */}
      <View style={styles.footer}>
        {cartItemCount > 0 && (
          <View style={styles.cartInfo}>
            <Text style={styles.cartInfoText}>{cartItemCount} in cart</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            product.stock <= 0 && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Text style={styles.addToCartText}>
            {cartItemCount > 0 ? 'Add More to Cart' : 'Add to Cart'}
          </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
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
  cartButton: {
    padding: 4,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4C29',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  productImage: {
    width: width,
    height: width,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 16,
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4C29',
    marginBottom: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartInfo: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  cartInfoText: {
    color: '#666',
    fontSize: 14,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FF4C29',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#FF4C29',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
}); 