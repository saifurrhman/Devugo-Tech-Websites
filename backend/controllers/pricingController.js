const PricingPlan = require('../models/PricingPlan');

exports.list = async (_req, res) => {
  try{
    const items = await PricingPlan.find({}).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await PricingPlan.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const { name, features = [], priceMonthly = 0, priceYearly = 0, recommended = false, published = true, order = 0 } = req.body || {};
    const slug = (name||'').toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    const item = await PricingPlan.create({ name, slug, features, priceMonthly, priceYearly, recommended: !!recommended, published: !!published, order });
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    if (typeof payload.name === 'string') {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
    }
    const item = await PricingPlan.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await PricingPlan.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
