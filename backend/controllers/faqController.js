const ClientFaq = require('../models/ClientFaq');

exports.list = async (req, res) => {
  try{
    const { published, limit } = req.query;
    const filter = {};
    if (typeof published !== 'undefined') filter.published = published === 'true';
    let q = ClientFaq.find(filter).sort({ order: 1, createdAt: -1 });
    if (limit) q = q.limit(parseInt(limit, 10) || 0);
    const items = await q;
    res.json({ items });
  }catch(err){ res.status(500).json({ error:'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await ClientFaq.findById(req.params.id);
    if(!item) return res.status(404).json({ error:'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error:'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const payload = req.body || {};
    const item = await ClientFaq.create(payload);
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error:'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    const item = await ClientFaq.findByIdAndUpdate(req.params.id, payload, { new:true });
    if(!item) return res.status(404).json({ error:'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error:'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await ClientFaq.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error:'Server error', details: err.message }); }
};
