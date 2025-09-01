import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../api/config';
import { formatCurrencyVND } from '../utils/format';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 24; // Two cards per row with margins

export default function ProductCard({ product }) {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  
  // Format price with currency
  const formatPrice = (price) => formatCurrencyVND(price);
  
  // Handle card press
  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // Handle add to cart
  const handleAddToCart = (event) => {
    event.stopPropagation(); // Prevent navigation to details
    addToCart(product);
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <Image 
        source={{ uri: getImageUrl(product.image_url) || 'https://via.placeholder.com/150' }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.category}>{product.category_name || 'Uncategorized'}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddToCart} 
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  infoContainer: {
    padding: 10,
  },
  category: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    height: 40,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4C29',
  },
  addButton: {
    backgroundColor: '#FF4C29',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
}); 