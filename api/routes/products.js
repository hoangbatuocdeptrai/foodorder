const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const queryParams = [];
    
    // Apply filters
    if (category) {
      query += ' AND p.category_id = ?';
      queryParams.push(category);
    }
    
    if (featured === 'true') {
      query += ' AND p.featured = 1';
    }
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [products] = await db.query(query, queryParams);
    res.json(products);
  } catch (error) {
    console.error('Error in GET /products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`, 
      [req.params.id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error in GET /products/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product (Admin only)
router.post('/', [verifyToken, isAdmin, upload], async (req, res) => {
  try {
    const { name, description, price, category_id, stock, featured } = req.body;
    
    // Validate input
    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }
    
    // Process image if uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Image URL saved:', imageUrl);
    }
    
    // Insert new product
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, category_id, image_url, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name, 
        description || null, 
        price,
        category_id || null,
        imageUrl,
        stock || 0,
        featured === 'true' ? 1 : 0
      ]
    );
    
    // Get category name if provided
    let categoryName = null;
    if (category_id) {
      const [categories] = await db.query('SELECT name FROM categories WHERE id = ?', [category_id]);
      if (categories.length > 0) {
        categoryName = categories[0].name;
      }
    }
    
    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: result.insertId,
        name,
        description,
        price,
        category_id: category_id || null,
        category_name: categoryName,
        image_url: imageUrl,
        stock: stock || 0,
        featured: featured === 'true',
        created_at: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error in POST /products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', [verifyToken, isAdmin, upload], async (req, res) => {
  try {
    const { name, description, price, category_id, stock, featured } = req.body;
    const productId = req.params.id;
    
    // Get existing product
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const existingProduct = products[0];
    
    // Process image if uploaded
    let imageUrl = existingProduct.image_url;
    
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('New image URL saved:', imageUrl);
      
      // Delete old image if it exists
      if (existingProduct.image_url) {
        try {
          // Ensure we always resolve to the correct uploads directory, even if image_url begins with '/'
          const normalizedOldPath = existingProduct.image_url.startsWith('/') 
            ? existingProduct.image_url.slice(1) 
            : existingProduct.image_url;
          const oldImagePath = path.join(__dirname, '..', normalizedOldPath);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Old image deleted:', oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
          // Continue even if image deletion fails
        }
      }
    }
    
    // Update product
    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, stock = ?, featured = ? WHERE id = ?',
      [
        name || existingProduct.name,
        description !== undefined ? description : existingProduct.description,
        price || existingProduct.price,
        category_id !== undefined ? category_id : existingProduct.category_id,
        imageUrl,
        stock !== undefined ? stock : existingProduct.stock,
        featured !== undefined ? (featured === 'true' ? 1 : 0) : existingProduct.featured,
        productId
      ]
    );
    
    // Get category name if provided
    let categoryName = null;
    const categoryIdToUse = category_id !== undefined ? category_id : existingProduct.category_id;
    
    if (categoryIdToUse) {
      const [categories] = await db.query('SELECT name FROM categories WHERE id = ?', [categoryIdToUse]);
      if (categories.length > 0) {
        categoryName = categories[0].name;
      }
    }
    
    res.json({
      message: 'Product updated successfully',
      product: {
        id: Number(productId),
        name: name || existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        price: price || existingProduct.price,
        category_id: categoryIdToUse,
        category_name: categoryName,
        image_url: imageUrl,
        stock: stock !== undefined ? stock : existingProduct.stock,
        featured: featured !== undefined ? featured === 'true' : Boolean(existingProduct.featured),
        updated_at: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error in PUT /products/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Get product to delete
    const [products] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    
    // Delete image file if it exists
    if (product.image_url) {
      try {
        // Ensure we always resolve to the correct uploads directory, even if image_url begins with '/'
        const normalizedPath = product.image_url.startsWith('/') 
          ? product.image_url.slice(1) 
          : product.image_url;
        const imagePath = path.join(__dirname, '..', normalizedPath);
        console.log('Attempting to delete image at:', imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Image deleted successfully');
        } else {
          console.log('Image file not found at path:', imagePath);
        }
      } catch (err) {
        console.error('Error deleting product image:', err);
        // Continue with deletion even if image removal fails
      }
    }
    
    // Delete product
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [productId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or already deleted' });
    }
    
    res.json({ 
      message: 'Product deleted successfully',
      id: productId
    });
    
  } catch (error) {
    console.error('Error in DELETE /products/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 