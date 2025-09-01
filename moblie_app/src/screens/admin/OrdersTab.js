import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllOrders, updateOrderStatus } from '../../api/orders';
import { formatCurrencyVND } from '../../utils/format';
import Toast from 'react-native-toast-message';

export default function OrdersTab({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#FFA000' },
    { value: 'processing', label: 'Processing', color: '#2196F3' },
    { value: 'shipped', label: 'Shipped', color: '#9C27B0' },
    { value: 'delivered', label: 'Delivered', color: '#4CAF50' },
    { value: 'cancelled', label: 'Cancelled', color: '#F44336' }
  ];

  // Fetch all orders
  const loadOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadOrders();
      setLoading(false);
    };
    
    fetchData();
  }, [loadOrders]);

  // Refresh orders
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // View order details
  const viewOrderDetails = (orderId) => {
    navigation.navigate('AdminOrderDetail', { orderId });
  };

  // Open status selection
  const handleUpdateStatus = (orderId, currentStatus) => {
    // For web, we'll show our custom modal
    // For mobile, continue using Alert
    if (Platform.OS === 'web') {
      setSelectedOrderId(orderId);
      setStatusModalVisible(true);
    } else {
      Alert.alert(
        'Update Order Status',
        'Select the new status for this order',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Processing', onPress: () => updateStatus(orderId, 'processing') },
          { text: 'Shipped', onPress: () => updateStatus(orderId, 'shipped') },
          { text: 'Delivered', onPress: () => updateStatus(orderId, 'delivered') },
          { text: 'Cancelled', onPress: () => updateStatus(orderId, 'cancelled') }
        ]
      );
    }
  };
  
  // Handle status selection from modal
  const handleSelectStatus = (status) => {
    setStatusModalVisible(false);
    if (selectedOrderId && status) {
      updateStatus(selectedOrderId, status);
    }
  };

  // API call to update status
  const updateStatus = async (orderId, newStatus) => {
    if (processingStatus) return; // Prevent multiple calls
    
    try {
      setProcessingStatus(true);
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      
      // Call API
      const result = await updateOrderStatus(orderId, newStatus);
      console.log('Update result:', result);
      
      // Update local state after successful API call
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Show success message
      if (Platform.OS === 'web') {
        Toast.show({
          type: 'success',
          text1: 'Status Updated',
          text2: `Order #${orderId} status updated to ${newStatus}`,
          visibilityTime: 2000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Status Updated',
          text2: `Order #${orderId} status updated to ${newStatus}`,
          visibilityTime: 2000,
        });
      }
      
      // Refresh orders list
      await loadOrders();
      
    } catch (err) {
      console.error('Error updating order status:', err);
      
      // Show detailed error
      let errorMsg = 'Failed to update order status. Please try again.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      // Show error message
      if (Platform.OS === 'web') {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: errorMsg,
          visibilityTime: 3000,
        });
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setProcessingStatus(false);
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA000';
      case 'processing':
        return '#2196F3';
      case 'shipped':
        return '#9C27B0';
      case 'delivered':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  // Render order item
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <Text style={styles.customerInfo}>
            {item.username || 'Unknown User'} - {formatDate(item.created_at)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
          onPress={() => handleUpdateStatus(item.id, item.status)}
          disabled={processingStatus}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#fff" style={styles.statusIcon} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items:</Text>
          <Text style={styles.infoValue}>
            {item.items ? item.items.length : 0} products
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.infoValue}>{formatCurrencyVND(item.total_amount)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment:</Text>
          <Text style={styles.infoValue}>
            {item.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : item.payment_method}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => viewOrderDetails(item.id)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#FF4C29" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4C29" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {processingStatus && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF4C29" />
          <Text style={styles.loadingText}>Updating status...</Text>
        </View>
      )}
      
      {/* Error message if any */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#FF4C29"]} />
        }
        ListEmptyComponent={
          !loading && !error && (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          )
        }
      />
      
      {/* Status Selection Modal for Web */}
      {Platform.OS === 'web' && (
        <Modal
          visible={statusModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select New Status</Text>
              
              <View style={styles.statusOptions}>
                {statusOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.statusOption, { backgroundColor: option.color }]}
                    onPress={() => handleSelectStatus(option.value)}
                  >
                    <Text style={styles.statusOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setStatusModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusIcon: {
    marginLeft: 4,
  },
  orderInfo: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewButtonText: {
    color: '#FF4C29',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusOptions: {
    width: '100%',
    marginBottom: 20,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  statusOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
  },
}); 