// API configuration
export const API_URL = 'http://localhost:5000/api'; 

// Auth endpoints
export const LOGIN_URL = `${API_URL}/auth/login`;
export const REGISTER_URL = `${API_URL}/auth/register`;

// Product endpoints
export const PRODUCTS_URL = `${API_URL}/products`;

// Category endpoints
export const CATEGORIES_URL = `${API_URL}/categories`;

// Order endpoints
export const ORDERS_URL = `${API_URL}/orders`;

// Helper function to build image URLs
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path;
  
  // Use the same base URL as API but without the /api part
  const baseUrl = API_URL.replace('/api', '');
  
  // Ensure path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${formattedPath}`;
}; 