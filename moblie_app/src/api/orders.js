import axios from 'axios';
import { ORDERS_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(ORDERS_URL, orderData, headers);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

// Get current user's orders
export const getUserOrders = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${ORDERS_URL}/my-orders`, headers);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error.response?.data || error.message);
    throw error;
  }
};

// Get a specific order by ID
export const getOrderById = async (orderId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${ORDERS_URL}/${orderId}`, headers);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error.response?.data || error.message);
    throw error;
  }
};

// Admin: Get all orders
export const getAllOrders = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(ORDERS_URL, headers);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error.response?.data || error.message);
    throw error;
  }
};

// Admin: Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    // Lấy token xác thực
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log(`Updating order ${orderId} to status: ${status}`);
    console.log(`API URL: ${ORDERS_URL}/${orderId}/status`);
    
    // Gọi API với đầy đủ thông tin
    const response = await axios({
      method: 'PATCH',
      url: `${ORDERS_URL}/${orderId}/status`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: { status }
    });
    
    console.log('Update status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    
    // Log chi tiết lỗi
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    throw error;
  }
}; 