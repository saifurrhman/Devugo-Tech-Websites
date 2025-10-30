const mongoose = require('mongoose');
const SocialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model('SocialLink', SocialLinkSchema);
