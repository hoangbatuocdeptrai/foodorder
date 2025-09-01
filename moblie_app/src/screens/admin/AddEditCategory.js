import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createCategory, updateCategory, getCategories } from '../../api/categories';
import { getImageUrl } from '../../api/config';
import Toast from 'react-native-toast-message';

export default function AddEditCategory({ route, navigation }) {
  // Get params from navigation
  const { mode, category } = route.params || { mode: 'add' };
  const isEditMode = mode === 'edit';
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Load category data if in edit mode
  useEffect(() => {
    if (isEditMode && category) {
      setName(category.name || '');
      setDescription(category.description || '');
      
      if (category.image_url) {
        setExistingImage(category.image_url);
      }
    }
  }, []);

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
    
    if (!name.trim()) errors.name = 'Category name is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setIsSaving(true);
  setError(null);

  const errors = {};

  // 1. Kiểm tra tên rỗng
  if (!name.trim()) {
    errors.name = 'Category name is required';
  } else {
    // 2. Kiểm tra trùng tên với server
    try {
      const categories = await getCategories();
      // const { data: categories } = await getCategories();
      console.log(categories);
      const isDuplicate = categories.some(
        (cat) =>
          cat.name.toLowerCase() === name.trim().toLowerCase() &&
          (!isEditMode || cat.id !== category.id)
      );
      if (isDuplicate) {
        errors.name = 'Category name already exists';
      }
    } catch (err) {
      console.error('Error checking category name:', err);
      errors.name = 'Error checking category name';
    }
  }

  // 3. Cập nhật lỗi nếu có
  setFormErrors(errors);

  if (Object.keys(errors).length > 0) {
    setIsSaving(false);
    return; // dừng submit nếu có lỗi
  }

  // 4. Nếu không lỗi → gọi API thêm hoặc sửa
  try {
    const categoryData = {
      name: name.trim(),
      description,
    };

    if (image) {
      categoryData.image = {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `category_${Date.now()}.jpg`,
      };
    }

    if (isEditMode) {
      await updateCategory(category.id, categoryData);
      showToast('success', 'Category updated successfully');
    } else {
      await createCategory(categoryData);
      showToast('success', 'Category created successfully');
    }

    navigation.goBack();
  } catch (err) {
    console.error('Error saving category:', err);
    const errorMessage = err.message || 'Failed to save category';
    setError(errorMessage);
    showToast('error', errorMessage);
  } finally {
    setIsSaving(false);
  }
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
                style={styles.categoryImage} 
              />
            ) : existingImage ? (
              <Image 
                source={{ uri: getImageUrl(existingImage) }} 
                style={styles.categoryImage} 
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="list-outline" size={60} color="#aaa" />
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
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={[styles.input, formErrors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="Enter category name"
            />
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter category description"
              multiline
              numberOfLines={4}
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
                {isEditMode ? 'Update Category' : 'Create Category'}
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
  categoryImage: {
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