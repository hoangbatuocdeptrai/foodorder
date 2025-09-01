const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.json(categories);
  } catch (error) {
    console.error('Error in GET /categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(categories[0]);
  } catch (error) {
    console.error('Error in GET /categories/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new category (Admin only)
router.post('/', [verifyToken, isAdmin, upload], async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category name already exists (case-insensitive)
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?)',
      [name.trim()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Process image if uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Image URL saved:', imageUrl);
    }
    
    // Insert new category
    const [result] = await db.query(
      'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
      [name, description || null, imageUrl]
    );
    
    res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: result.insertId,
        name,
        description,
        image_url: imageUrl,
        created_at: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error in POST /categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (Admin only)
router.put('/:id', [verifyToken, isAdmin, upload], async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    
    // Get existing category
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const existingCategory = categories[0];
    
    // Check for duplicate name if new name is provided and different from current
    if (name && name.trim().toLowerCase() !== existingCategory.name.trim().toLowerCase()) {
      const [duplicate] = await db.query(
        'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND id != ?',
        [name.trim(), categoryId]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }
    // Process image if uploaded
    let imageUrl = existingCategory.image_url;
    
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('New image URL saved:', imageUrl);
      
      // Delete old image if it exists
      if (existingCategory.image_url) {
        try {
          // Ensure we always resolve to the correct uploads directory, even if image_url begins with '/'
          const normalizedOldPath = existingCategory.image_url.startsWith('/') 
            ? existingCategory.image_url.slice(1) 
            : existingCategory.image_url;
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
    
    // Update category
    await db.query(
      'UPDATE categories SET name = ?, description = ?, image_url = ? WHERE id = ?',
      [
        name || existingCategory.name,
        description !== undefined ? description : existingCategory.description,
        imageUrl,
        categoryId
      ]
    );
    
    res.json({
      message: 'Category updated successfully',
      category: {
        id: Number(categoryId),
        name: name || existingCategory.name,
        description: description !== undefined ? description : existingCategory.description,
        image_url: imageUrl,
        updated_at: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error in PUT /categories/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Get category to delete
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
    
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = categories[0];
    
    // Delete image file if it exists
    if (category.image_url) {
      try {
        // Ensure we always resolve to the correct uploads directory, even if image_url begins with '/'
        const normalizedPath = category.image_url.startsWith('/') 
          ? category.image_url.slice(1) 
          : category.image_url;
        const imagePath = path.join(__dirname, '..', normalizedPath);
        console.log('Attempting to delete image at:', imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Image deleted successfully');
        } else {
          console.log('Image file not found at path:', imagePath);
        }
      } catch (err) {
        console.error('Error deleting category image:', err);
        // Continue with deletion even if image removal fails
      }
    }
    
    // If any products reference this category, set their category_id to NULL (handled by FK as well)
    await db.query('UPDATE products SET category_id = NULL WHERE category_id = ?', [categoryId]);
    
    // Delete category
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found or already deleted' });
    }
    
    res.json({ 
      message: 'Category deleted successfully',
      id: categoryId
    });
    
  } catch (error) {
    console.error('Error in DELETE /categories/:id:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 