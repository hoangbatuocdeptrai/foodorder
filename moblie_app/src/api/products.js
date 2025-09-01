import axios from 'axios';
import { PRODUCTS_URL } from './config';
import { getToken } from './auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to append image (handles native & web)
const appendImageToFormData = async (formData, imageObj, defaultNamePrefix = 'product') => {
  if (!imageObj) return;

  if (Platform.OS === 'web') {
    // On web we need a File instance
    try {
      const response = await fetch(imageObj.uri);
      const blob = await response.blob();
      const fileName = imageObj.name || `${defaultNamePrefix}_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: blob.type || imageObj.type || 'image/jpeg' });
      formData.append('image', file);
    } catch (err) {
      console.error('Error converting image for web upload:', err);
    }
  } else {
    // Native platforms can send the object directly
    formData.append('image', {
      uri: imageObj.uri,
      type: imageObj.type || 'image/jpeg',
      name: imageObj.name || `${defaultNamePrefix}_${Date.now()}.jpg`,
    });
  }
};

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// Get all products with optional filtering
export const getProducts = async (params) => {
  try {
    const response = await axios.get(PRODUCTS_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    const response = await axios.get(PRODUCTS_URL, { params: { featured: true } });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error.response?.data || error.message);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(PRODUCTS_URL, { params: { category: categoryId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error.response?.data || error.message);
    throw error;
  }
};

// Search products
export const searchProducts = async (query) => {
  try {
    const response = await axios.get(PRODUCTS_URL, { params: { search: query } });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error.response?.data || error.message);
    throw error;
  }
};

// Get a single product by ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${PRODUCTS_URL}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error.response?.data || error.message);
    throw error;
  }
};

// Admin: Create new product (requires authentication)
export const createProduct = async (productData) => {
  try {
    const token = await getToken();

    if (!token) {
      throw { message: 'Authentication required' };
    }

    const formData = new FormData();

    // Add text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'image' && productData[key] !== undefined && productData[key] !== null) {
        formData.append(key, productData[key].toString());
      }
    });

    // Add image file (nếu có)
    if (productData.image) {
      await appendImageToFormData(formData, productData.image, 'image'); // hoặc 'product'
    }

    const response = await axios.post(PRODUCTS_URL, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
        // ⚠️ KHÔNG set 'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Network error' };
  }
};

// Admin: Update product (requires authentication)
export const updateProduct = async (productId, productData) => {
  try {
    const token = await getToken();

    if (!token) {
      throw { message: 'Authentication required' };
    }

    const formData = new FormData();

    // Append text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'image' && productData[key] !== undefined && productData[key] !== null) {
        formData.append(key, productData[key].toString());
      }
    });

    // Append image if available
    if (productData.image) {
      await appendImageToFormData(formData, productData.image, 'image');
    }

    const response = await axios.put(`${PRODUCTS_URL}/${productId}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating product:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Network error' };
  }
};

// Admin: Delete product (requires authentication)
export const deleteProduct = async (productId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${PRODUCTS_URL}/${productId}`, headers);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error.response?.data || error.message);
    throw error;
  }
}; 