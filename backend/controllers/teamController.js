const TeamMember = require('../models/TeamMember');

exports.list = async (_req, res) => {
  try{
    const members = await TeamMember.find({}).sort({ createdAt: -1 });
    res.json({ members });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.get = async (req, res) => {
  try{
    const member = await TeamMember.findById(req.params.id);
    if(!member) return res.status(404).json({ error: 'Not found' });
    res.json({ member });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.create = async (req, res) => {
  try{
    const { name, role, bio, avatar, socials = {} } = req.body || {};
    const member = await TeamMember.create({ name, role, bio, avatar, socials });
    res.status(201).json({ member });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.update = async (req, res) => {
  try{
    const payload = req.body || {};
    const member = await TeamMember.findByIdAndUpdate(req.params.id, payload, { new: true });
    if(!member) return res.status(404).json({ error: 'Not found' });
    res.json({ member });
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};

exports.remove = async (req, res) => {
  try{
    await TeamMember.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }catch(err){ res.status(500).json({ error: 'Server error', details: err.message }); }
};
