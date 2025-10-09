const Service = require('../models/Service');

// Admin: list all (draft + published)
exports.list = async (_req, res) => {
  try{
    const items = await Service.find({}).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

// Public: only published
exports.listPublished = async (_req, res) => {
  try{
    const items = await Service.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

// Public: get by slug (published-only)
exports.getBySlug = async (req, res) => {
  try{
    const slug = req.params.slug;
    const item = await Service.findOne({ slug, published: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await Service.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const { title, description, features = [], icon, published = true, order = 0 } = req.body || {};
    const slug = (title||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    const item = await Service.create({ title, description, features, icon, published: !!published, order, slug });
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    if (typeof payload.title === 'string') {
      payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    }
    const item = await Service.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await Service.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
