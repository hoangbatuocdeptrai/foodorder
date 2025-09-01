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
import { getCategories, deleteCategory } from '../../api/categories';
import { getImageUrl } from '../../api/config';
import { useFocusEffect } from '@react-navigation/native';

export default function CategoriesTab({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Use useFocusEffect to reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );
  
  // Filter categories when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => {
        return (
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      });
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);
  
  // Load categories from API
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle add new category
  const handleAddCategory = () => {
    navigation.navigate('AddEditCategory', { mode: 'add' });
  };
  
  // Handle edit category
  const handleEditCategory = (category) => {
    navigation.navigate('AddEditCategory', { mode: 'edit', category });
  };
  
  // Handle delete category
  const handleDeleteCategory = (categoryId) => {
    const confirmAndDelete = async () => {
      try {
        setIsLoading(true);
        const response = await deleteCategory(categoryId);
        console.log('Delete response:', response);
        setCategories(categories.filter(c => c.id !== categoryId));
        if (Platform.OS === 'web') {
          window.alert('Category deleted successfully.');
        } else {
          Alert.alert('Success', 'Category deleted successfully.');
        }
        loadCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        const msg = err.message || 'Unknown error';
        if (Platform.OS === 'web') {
          window.alert(`Failed to delete category: ${msg}`);
        } else {
          Alert.alert('Error', `Failed to delete category: ${msg}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this category? This will also affect products assigned to this category.')) {
        confirmAndDelete();
      }
    } else {
      Alert.alert(
        'Delete Category',
        'Are you sure you want to delete this category? This will also affect products assigned to this category.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmAndDelete },
        ]
      );
    }
  };
  
  // Render category item
  const renderCategoryItem = ({ item }) => {
    return (
      <View style={styles.categoryItem}>
        {item.image_url ? (
          <Image 
            source={{ uri: getImageUrl(item.image_url) }} 
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="list" size={24} color="#aaa" />
          </View>
        )}
        
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.categoryDescription} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
        
        <View style={styles.categoryActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="create-outline" size={20} color="#2C394B" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteCategory(item.id)}
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
        <Ionicons name="list-outline" size={60} color="#ddd" />
        <Text style={styles.emptyTitle}>No categories found</Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 'Try a different search query.' : 'Add your first category to get started.'}
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
          placeholder="Search categories..."
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
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          onRefresh={loadCategories}
          refreshing={isLoading}
        />
      )}
      
      {/* Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddCategory}>
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryImage: {
    width: 70,
    height: 70,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 70,
    height: 70,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    padding: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#888',
  },
  categoryActions: {
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