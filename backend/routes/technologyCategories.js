const express = require('express');
const router = express.Router();
const TechnologyCategory = require('../models/TechnologyCategory');
const Technology = require('../models/Technology');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/technology-categories
// @desc    Get all technology categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    // Only return active categories for public users (unless query says otherwise)
    if (req.query.status !== undefined) {
      filter.status = req.query.status === 'true';
    }

    const categories = await TechnologyCategory.find(filter).sort({ order: 1, name: 1 });
    res.json({ success: true, items: categories });
  } catch (err) {
    console.error('Error fetching technology categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/technology-categories
// @desc    Create a technology category
// @access  Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const category = new TechnologyCategory(req.body);
    await category.save();
    res.status(201).json({ success: true, item: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    console.error('Error creating technology category:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/technology-categories/:id
// @desc    Update a technology category
// @access  Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await TechnologyCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // If renaming, we should also update technologies that have this category name!
    const oldName = category.name;
    const newName = req.body.name;

    Object.assign(category, req.body);
    await category.save();

    // If the name changed, update existing technologies
    if (newName && oldName !== newName) {
      await Technology.updateMany(
        { category: oldName },
        { $set: { category: newName } }
      );
    }

    res.json({ success: true, item: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    console.error('Error updating technology category:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/technology-categories/:id
// @desc    Delete a technology category
// @access  Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await TechnologyCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Safeguard: Check if any technologies are using this category
    const techCount = await Technology.countDocuments({ category: category.name });
    if (techCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete: ${techCount} tools are currently assigned to "${category.name}". Please reassign them first.` 
      });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category removed' });
  } catch (err) {
    console.error('Error deleting technology category:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/technology-categories/reorder
// @desc    Update order of multiple categories
// @access  Admin
router.put('/action/reorder', protect, authorize('admin'), async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Bulk update the order
    const operations = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } }
      }
    }));

    if (operations.length > 0) {
      await TechnologyCategory.bulkWrite(operations);
    }

    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    console.error('Error reordering technology categories:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
