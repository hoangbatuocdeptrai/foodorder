import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOGIN_URL, REGISTER_URL } from './config';

// Register new user
export const register = async (userData) => {
  try {
    const response = await axios.post(REGISTER_URL, userData);
    
    // Store token on successful registration
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(LOGIN_URL, credentials);
    
    // Store token on successful login
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Network error' };
  }
};

// Logout user
export const logout = async () => {
  try {
    // Clear both token and user data
    await Promise.all([
      AsyncStorage.removeItem('token'),
      AsyncStorage.removeItem('user')
    ]);
    
    // Clear all cart data as well (optional)
    await AsyncStorage.removeItem('cart');
    
    // Small delay to ensure AsyncStorage operations complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

// Check if user is admin
export const isUserAdmin = async () => {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
};

// Get authentication token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
}; 