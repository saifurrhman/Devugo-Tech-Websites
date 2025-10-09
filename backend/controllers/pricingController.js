const PricingPlan = require('../models/PricingPlan');

// List all pricing plans with optional filters
exports.list = async (req, res) => {
  try {
    const filter = {};
    
    // Filter by service if provided
    if (req.query.service) {
      filter.service = req.query.service;
    }
    
    // Filter by published status
    if (typeof req.query.published !== 'undefined') {
      const val = String(req.query.published).toLowerCase();
      filter.published = (val === '1' || val === 'true');
    }
    
    // Filter by plan type
    if (req.query.planType) {
      filter.planType = req.query.planType;
    }
    
    // Sorting: by order (asc), then by createdAt (desc)
    const items = await PricingPlan.find(filter)
      .populate('service', 'title slug')
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    res.json({ items });
  } catch(err) { 
    console.error('Error listing pricing plans:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    }); 
  }
};

// Get single pricing plan by ID
exports.get = async (req, res) => {
  try {
    const item = await PricingPlan.findById(req.params.id)
      .populate('service', 'title slug')
      .lean();
    
    if (!item) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    
    res.json({ item });
  } catch(err) { 
    console.error('Error fetching pricing plan:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    }); 
  }
};

// Create new pricing plan
exports.create = async (req, res) => {
  try {
    const { 
      name, 
      features = [], 
      priceMonthly = 0, 
      priceYearly = 0, 
      priceOneTime = 0,
      recommended = false, 
      published = true, 
      order = 0, 
      service = null,
      planType = 'subscription',
      description = ''
    } = req.body || {};
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Plan name is required' });
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    
    // Create pricing plan
    const item = await PricingPlan.create({ 
      name: name.trim(), 
      slug, 
      features: Array.isArray(features) ? features : [], 
      priceMonthly: Number(priceMonthly) || 0, 
      priceYearly: Number(priceYearly) || 0,
      priceOneTime: Number(priceOneTime) || 0,
      recommended: !!recommended, 
      published: !!published, 
      order: Number(order) || 0, 
      service: service || null,
      planType,
      description: description || ''
    });
    
    res.status(201).json({ item });
  } catch(err) { 
    console.error('Error creating pricing plan:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    }); 
  }
};

// Update existing pricing plan
exports.update = async (req, res) => {
  try {
    const payload = req.body || {};
    
    // Auto-generate slug if name is updated
    if (typeof payload.name === 'string' && payload.name.trim()) {
      payload.slug = payload.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }
    
    // Convert numeric fields
    if (payload.priceMonthly !== undefined) {
      payload.priceMonthly = Number(payload.priceMonthly) || 0;
    }
    if (payload.priceYearly !== undefined) {
      payload.priceYearly = Number(payload.priceYearly) || 0;
    }
    if (payload.priceOneTime !== undefined) {
      payload.priceOneTime = Number(payload.priceOneTime) || 0;
    }
    if (payload.order !== undefined) {
      payload.order = Number(payload.order) || 0;
    }
    
    // Convert boolean fields
    if (payload.recommended !== undefined) {
      payload.recommended = !!payload.recommended;
    }
    if (payload.published !== undefined) {
      payload.published = !!payload.published;
    }
    
    const item = await PricingPlan.findByIdAndUpdate(
      req.params.id, 
      payload, 
      { 
        new: true,
        runValidators: true 
      }
    ).lean();
    
    if (!item) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    
    res.json({ item });
  } catch(err) { 
    console.error('Error updating pricing plan:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    }); 
  }
};

// Delete pricing plan
exports.remove = async (req, res) => {
  try {
    const deleted = await PricingPlan.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    
    res.status(204).end();
  } catch(err) { 
    console.error('Error deleting pricing plan:', err);
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message 
    }); 
  }
};