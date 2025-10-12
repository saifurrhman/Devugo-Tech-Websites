const BlogCategory = require('../models/BlogCategory');

exports.list = async (_req, res) => {
  try{
    const items = await BlogCategory.find({}).sort({ name: 1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await BlogCategory.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const { name, slug } = req.body || {};
    const item = await BlogCategory.create({ name, slug });
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    const item = await BlogCategory.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await BlogCategory.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
