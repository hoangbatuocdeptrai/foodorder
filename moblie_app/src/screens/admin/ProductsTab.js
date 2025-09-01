import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, deleteProduct } from '../../api/products';
import { getImageUrl } from '../../api/config';
import { formatCurrencyVND } from '../../utils/format';
import { useFocusEffect } from '@react-navigation/native';

export default function ProductsTab({ navigation }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );
  
  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => {
        return (
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);
  
  // Load products from API
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle add new product
  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', { mode: 'add' });
  };
  
  // Handle edit product
  const handleEditProduct = (product) => {
    navigation.navigate('AddEditProduct', { mode: 'edit', product });
  };
  
  // Handle delete product
  const handleDeleteProduct = (productId) => {
    const confirmAndDelete = async () => {
      try {
        setIsLoading(true);
        const response = await deleteProduct(productId);
        console.log('Delete response:', response);
        setProducts(products.filter(p => p.id !== productId));
        if (Platform.OS === 'web') {
          window.alert('Product deleted successfully.');
        } else {
          Alert.alert('Success', 'Product deleted successfully.');
        }
        loadProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        const msg = err.message || 'Unknown error';
        if (Platform.OS === 'web') {
          window.alert(`Failed to delete product: ${msg}`);
        } else {
          Alert.alert('Error', `Failed to delete product: ${msg}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        confirmAndDelete();
      }
    } else {
      Alert.alert(
        'Delete Product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmAndDelete },
        ]
      );
    }
  };
  
  // Format price
  const formatPrice = (price) => formatCurrencyVND(price);
  
  // Render product item
  const renderProductItem = ({ item }) => {
    return (
      <View style={styles.productItem}>
        <Image 
          source={{ uri: getImageUrl(item.image_url) || 'https://via.placeholder.com/100' }} 
          style={styles.productImage}
          resizeMode="cover"
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category_name || 'Uncategorized'}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productStock}>In Stock: {item.stock || 0}</Text>
          {item.featured && <Text style={styles.featuredBadge}>Featured</Text>}
        </View>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditProduct(item)}
          >
            <Ionicons name="create-outline" size={20} color="#2C394B" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4C29" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Render empty list
  const renderEmptyList = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shirt-outline" size={60} color="#ddd" />
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Try a different search query.' : 'Add your first product to get started.'}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4C29" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          onRefresh={loadProducts}
          refreshing={isLoading}
        />
      )}
      
      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddProduct}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: '#555',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  productActions: {
    justifyContent: 'center',
    padding: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
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
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF4C29',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
}); 