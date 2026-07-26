const Technology = require('../models/Technology');

exports.list = async (req, res) => {
  try {
    const { category, status, featured } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (status !== undefined) query.status = status === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    const items = await Technology.find(query).sort({ order: 1, name: 1 });
    res.json({ items });
  } catch(err) { 
    res.status(500).json({ error: 'Server error', details: err.message }); 
  }
};

exports.get = async (req, res) => {
  try {
    const item = await Technology.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  } catch(err) { 
    res.status(500).json({ error: 'Server error', details: err.message }); 
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body || {};
    if(!name) return res.status(400).json({ error: 'Name required' });
    
    // Assign order automatically if not provided
    if (req.body.order === undefined) {
      const highest = await Technology.findOne().sort({ order: -1 });
      req.body.order = highest ? highest.order + 1 : 0;
    }
    
    const item = await Technology.create(req.body);
    res.status(201).json({ item });
  } catch(err) { 
    res.status(500).json({ error: 'Server error', details: err.message }); 
  }
};

exports.update = async (req, res) => {
  try {
    const payload = req.body || {};
    if (typeof payload.name === 'string'){
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    }
    const item = await Technology.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  } catch(err) { 
    res.status(500).json({ error: 'Server error', details: err.message }); 
  }
};

exports.remove = async (req, res) => {
  try {
    await Technology.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch(err) { 
    res.status(500).json({ error: 'Server error', details: err.message }); 
  }
};

exports.reorder = async (req, res) => {
  try {
    const { items } = req.body; // Expects an array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid payload, expected array of items' });
    }
    
    // Process reorder in parallel
    const operations = items.map(item => 
      Technology.findByIdAndUpdate(item.id, { order: item.order })
    );
    await Promise.all(operations);
    
    res.json({ success: true, message: 'Reordered successfully' });
  } catch(err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const item = await Technology.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    
    item.status = !item.status;
    await item.save();
    
    res.json({ item });
  } catch(err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
