const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, index: true },
    description: String,
    thumbnails: [String],
    tags: [String],
    url: String,
    client: String,
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', PortfolioSchema);
