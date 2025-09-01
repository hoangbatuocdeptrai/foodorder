const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all orders (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.username, u.email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error in GET /orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders for current user
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [orders] = await db.query(`
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error in GET /orders/my-orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const isUserAdmin = req.user.role === 'admin';
    
    // Query to get order details with conditional check for admin
    let query = `
      SELECT o.*, u.username, u.email 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    
    // If not admin, make sure user can only see their own orders
    if (!isUserAdmin) {
      query += ' AND o.user_id = ?';
    }
    
    const [orders] = await db.query(
      query, 
      isUserAdmin ? [orderId] : [orderId, userId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await db.query(`
      SELECT oi.*, p.name, p.image_url 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    order.items = items;
    
    res.json(order);
  } catch (error) {
    console.error('Error in GET /orders/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { 
      items, 
      shipping_address, 
      phone_number,
      payment_method = 'cash_on_delivery', // Default to COD
      total_amount
    } = req.body;
    
    const userId = req.user.id;
    
    if (!items || !items.length || !shipping_address || !phone_number) {
      return res.status(400).json({ 
        message: 'Order must include items, shipping address and phone number' 
      });
    }
    
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // Create the order
    const [orderResult] = await db.query(
      `INSERT INTO orders 
        (user_id, total_amount, shipping_address, phone_number, payment_method) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, total_amount, shipping_address, phone_number, payment_method]
    );
    
    const orderId = orderResult.insertId;
    
    // Add all order items
    for (const item of items) {
      // Get current product price and verify stock
      const [products] = await db.query(
        'SELECT price, stock FROM products WHERE id = ?', 
        [item.product_id]
      );
      
      if (products.length === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
      }
      
      const product = products[0];
      
      if (product.stock < item.quantity) {
        await db.query('ROLLBACK');
        return res.status(400).json({ 
          message: `Not enough stock for product with ID ${item.product_id}` 
        });
      }
      
      // Insert order item with current price
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, product.price]
      );
      
      // Update stock
      await db.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    res.status(201).json({
      message: 'Order created successfully',
      orderId
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error in POST /orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      message: 'Order status updated successfully',
      orderId,
      status
    });
  } catch (error) {
    console.error('Error in PATCH /orders/:id/status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 