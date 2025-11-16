const CompanyInfo = require('../models/CompanyInfo');

// Get public company info
exports.getPublic = async (_req, res) => {
  try {
    let info = await CompanyInfo.findOne();
    if (!info) {
      // Create default if doesn't exist
      info = await CompanyInfo.create({});
    }
    res.json({ info });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Get company info (admin)
exports.get = async (_req, res) => {
  try {
    let info = await CompanyInfo.findOne();
    if (!info) {
      info = await CompanyInfo.create({});
    }
    res.json({ info });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update company info (admin)
exports.update = async (req, res) => {
  try {
    let info = await CompanyInfo.findOne();
    if (!info) {
      info = await CompanyInfo.create(req.body);
    } else {
      info = await CompanyInfo.findByIdAndUpdate(info._id, req.body, { new: true });
    }
    res.json({ info });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};