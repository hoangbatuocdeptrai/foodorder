import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createProduct, updateProduct, getProductById } from '../../api/products';
import { getCategories } from '../../api/categories';
import { getImageUrl } from '../../api/config';
import Toast from 'react-native-toast-message';

export default function AddEditProduct({ route, navigation }) {
  // Get params from navigation
  const { mode, product } = route.params || { mode: 'add' };
  const isEditMode = mode === 'edit';
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? product.price.toString() : '');
      setStock(product.stock ? product.stock.toString() : '');
      setCategoryId(product.category_id || null);
      setFeatured(product.featured || false);
      
      if (product.image_url) {
        setExistingImage(product.image_url);
      }
    }
    
    // Load categories
    loadCategories();
  }, []);
  
  // Load categories from API
  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      showToast('error', 'Failed to load categories');
    }
  };
  
  // Show toast message
  const showToast = (type, message) => {
    Toast.show({
      type: type, // 'success', 'error', 'info'
      text1: type === 'success' ? 'Success' : 'Error',
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
    });
  };
  
  // Handle image picking
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        showToast('error', 'You need to grant camera roll permissions to upload an image');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      showToast('error', 'Failed to pick image');
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) errors.name = 'Product name is required';
    if (!price.trim()) errors.price = 'Price is required';
    else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) errors.price = 'Price must be a positive number';
    if (!stock.trim()) errors.stock = 'Stock quantity is required';
    else if (isNaN(parseInt(stock)) || parseInt(stock) < 0) errors.stock = 'Stock must be a positive number or zero';
    if (!categoryId) errors.category = 'Please select a category';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Create product data object
      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: categoryId,
        featured: featured ? 'true' : 'false', // Convert to string for server
      };
      
      // Add image if selected
      if (image) {
        // Create proper image object for FormData
        productData.image = {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `product_${Date.now()}.jpg`,
        };
      }
      
      let response;
      
      if (isEditMode) {
        response = await updateProduct(product.id, productData);
        showToast('success', 'Product updated successfully');
      } else {
        response = await createProduct(productData);
        showToast('success', 'Product created successfully');
      }
      
      // Navigate back to products list
      navigation.goBack();
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.message || 'Failed to save product';
      setError(errorMessage);
      showToast('error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Get selected category name
  const getSelectedCategoryName = () => {
    if (!categoryId) return 'Select Category';
    
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Select Category';
  };
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
    >
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          {/* Image Upload */}
          <View style={styles.imageUploadContainer}>
            {image ? (
              <Image 
                source={{ uri: image.uri }} 
                style={styles.productImage} 
              />
            ) : existingImage ? (
              <Image 
                source={{ uri: getImageUrl(existingImage) }} 
                style={styles.productImage} 
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={60} color="#aaa" />
                <Text style={styles.imagePlaceholderText}>No Image</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={20} color="white" />
              <Text style={styles.uploadButtonText}>
                {image || existingImage ? 'Change Image' : 'Upload Image'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Form Fields */}
          <View style={styles.formField}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={[styles.input, formErrors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="Enter product name"
            />
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter product description"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.rowFields}>
            <View style={[styles.formField, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={[styles.input, formErrors.price && styles.inputError]}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              {formErrors.price && <Text style={styles.errorText}>{formErrors.price}</Text>}
            </View>
            
            <View style={[styles.formField, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={[styles.input, formErrors.stock && styles.inputError]}
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                keyboardType="number-pad"
              />
              {formErrors.stock && <Text style={styles.errorText}>{formErrors.stock}</Text>}
            </View>
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, formErrors.category && styles.inputError]} 
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={styles.dropdownButtonText}>{getSelectedCategoryName()}</Text>
              <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color="#555" />
            </TouchableOpacity>
            {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
            
            {showCategoryDropdown && (
              <View style={styles.dropdown}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {categories.map((category) => (
                    <TouchableOpacity 
                      key={category.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategoryId(category.id);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        category.id === categoryId && styles.selectedItemText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <View style={[styles.formField, styles.switchField]}>
            <Text style={styles.label}>Featured Product</Text>
            <Switch
              value={featured}
              onValueChange={setFeatured}
              thumbColor={featured ? "#FF4C29" : "#f4f3f4"}
              trackColor={{ false: "#ececec", true: "#FF4C2980" }}
            />
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  formContainer: {
    padding: 16,
  },
  imageUploadContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: {
    color: '#aaa',
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#2C394B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#555',
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  selectedItemText: {
    color: '#FF4C29',
    fontWeight: 'bold',
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFE8E8',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#D32F2F',
    fontSize: 14,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  submitButton: {
    backgroundColor: '#FF4C29',
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 