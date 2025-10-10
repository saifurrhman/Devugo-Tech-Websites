const PortfolioCategory = require('../models/PortfolioCategory');

exports.list = async (_req, res) => {
  try{
    const items = await PortfolioCategory.find({}).sort({ name: 1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await PortfolioCategory.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const { name, active = true, description = '' } = req.body || {};
    if(!name) return res.status(400).json({ error: 'Name required' });
    const item = await PortfolioCategory.create({ name, active: !!active, description });
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    if (typeof payload.name === 'string'){
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    }
    const item = await PortfolioCategory.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await PortfolioCategory.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
