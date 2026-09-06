const Product = require('../models/Product');

function generateSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

exports.list = async (req, res) => {
  try {
    const { category, search, featured, active } = req.query;
    const filter = {};

    // By default for public requests, only list active items
    if (active === 'false') {
      filter.isActive = false;
    } else if (active !== 'all') {
      filter.isActive = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { tagline: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const items = await Product.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getFeatured = async (_req, res) => {
  try {
    const items = await Product.find({ isActive: true, isFeatured: true }).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    let item = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await Product.findById(id);
    }

    if (!item) {
      item = await Product.findOne({ slug: id });
    }

    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.title) {
      return res.status(400).json({ error: 'Product title is required' });
    }

    if (!payload.slug) {
      payload.slug = generateSlug(payload.title);
    }

    // Ensure unique slug
    let existing = await Product.findOne({ slug: payload.slug });
    if (existing) {
      payload.slug = `${payload.slug}-${Date.now()}`;
    }

    const item = await Product.create(payload);
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = req.body || {};

    if (payload.title && !payload.slug) {
      payload.slug = generateSlug(payload.title);
    }

    const item = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Product.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
