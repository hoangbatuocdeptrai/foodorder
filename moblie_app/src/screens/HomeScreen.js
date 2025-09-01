import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import HomeSlideshow from '../components/HomeSlideshow';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';

import { getCategories } from '../api/categories';
import { getFeaturedProducts } from '../api/products';
import { useCart } from '../context/CartContext';

export default function HomeScreen() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigation = useNavigation();
  const { getTotalItems } = useCart();
  
  // Fetch data (shared by initial load & pull-to-refresh)
  const fetchHomeData = useCallback(async () => {
    setError(null);
    try {
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getFeaturedProducts()
      ]);
      setCategories(categoriesData);
      setFeaturedProducts(productsData);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError('Failed to load data. Please try again.');
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchHomeData();
      setIsLoading(false);
    })();
  }, [fetchHomeData]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }, [fetchHomeData]);
  
  // Navigate to search results
  useEffect(() => {
  if (searchText.trim() === '') {
    setFilteredProducts(featuredProducts);
  } else {
    const filtered = featuredProducts.filter(product =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }
}, [searchText, featuredProducts]);
  
  // Navigate to category products
  const handleBannerPress = (banner) => {
    // Navigate based on banner content
    // This is a placeholder, you would typically navigate to a specific product list or promotion
    navigation.navigate('SearchResults', { query: banner.title });
  };
  
  // Navigate to cart
  const goToCart = () => {
    navigation.navigate('Cart');
  };
  
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4C29" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Fashion</Text>
          <Text style={styles.logoSubText}>Store</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={goToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#333" />
          {getTotalItems() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            // onSubmitEditing={handleSearch}
          />{searchText ? (
  <TouchableOpacity onPress={() => setSearchText('')}>
    <Ionicons name="close-circle" size={20} color="#888" />
  </TouchableOpacity>
) : null}
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF4C29"]} />
        }
      >
        {/* Banner Slideshow */}
        <HomeSlideshow onBannerPress={handleBannerPress} />
        
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>
        
        {/* Featured Products */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item) => item.id.toString()}
            horizontal={false}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productsContainer}
          />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF4C29',
  },
  logoSubText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  sectionContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
  },
  productsContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
}); 