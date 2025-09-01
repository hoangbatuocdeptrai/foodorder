import axios from 'axios';
import { CATEGORIES_URL } from './config';
import { getToken } from './auth';
import { Platform } from 'react-native';

// Helper to append image (handles native & web)
const appendImageToFormData = async (formData, imageObj, defaultNamePrefix = 'category') => {
  if (!imageObj) return;

  if (Platform.OS === 'web') {
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
    formData.append('image', {
      uri: imageObj.uri,
      type: imageObj.type || 'image/jpeg',
      name: imageObj.name || `${defaultNamePrefix}_${Date.now()}.jpg`,
    });
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const response = await axios.get(CATEGORIES_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(`${CATEGORIES_URL}/${categoryId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Create new category (Admin only)
export const createCategory = async (categoryData) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw { message: 'Authentication required' };
    }
    
    const formData = new FormData();
    
    // Add text fields to form data
    Object.keys(categoryData).forEach(key => {
      if (key !== 'image' && categoryData[key] !== undefined && categoryData[key] !== null) {
        formData.append(key, categoryData[key].toString());
      }
    });
    
    // Add image to form data if provided
    if (categoryData.image) {
      await appendImageToFormData(formData, categoryData.image, 'category');
    }
    
    const response = await axios.post(CATEGORIES_URL, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Update category (Admin only)
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw { message: 'Authentication required' };
    }
    
    const formData = new FormData();
    
    // Add text fields to form data
    Object.keys(categoryData).forEach(key => {
      if (key !== 'image' && categoryData[key] !== undefined && categoryData[key] !== null) {
        formData.append(key, categoryData[key].toString());
      }
    });
    
    // Add image to form data if provided
    if (categoryData.image) {
      await appendImageToFormData(formData, categoryData.image, 'category');
    }
    
    const response = await axios.put(`${CATEGORIES_URL}/${categoryId}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Delete category (Admin only)
export const deleteCategory = async (categoryId) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw { message: 'Authentication required' };
    }
    
    const response = await axios.delete(`${CATEGORIES_URL}/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
}; 