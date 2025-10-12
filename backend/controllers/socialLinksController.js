const SocialLink = require('../models/SocialLink');

// Public: list enabled links (newest first)
exports.listPublic = async (_req, res) => {
  try{
    const items = await SocialLink.find({ enabled: true }).sort({ createdAt: -1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

// Admin: list all (newest first)
exports.list = async (_req, res) => {
  try{
    const items = await SocialLink.find({}).sort({ createdAt: -1 });
    res.json({ items });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const item = await SocialLink.findById(req.params.id);
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const { platform, url, enabled = true } = req.body || {};
    const item = await SocialLink.create({ platform, url, enabled: !!enabled });
    res.status(201).json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    const item = await SocialLink.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!item) return res.status(404).json({ error: 'Not found' });
    res.json({ item });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await SocialLink.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
