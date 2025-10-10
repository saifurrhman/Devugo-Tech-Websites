const ClientReview = require('../models/ClientReview');

exports.list = async (req, res) => {
  try{
    const { featured } = req.query;
    const filter = {};
    if (typeof featured !== 'undefined') filter.featured = featured === 'true';
    const items = await ClientReview.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await ClientReview.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const payload = req.body || {};
    const item = await ClientReview.create(payload);
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    const item = await ClientReview.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await ClientReview.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
