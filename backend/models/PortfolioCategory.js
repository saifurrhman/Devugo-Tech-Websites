const mongoose = require('mongoose');

const PortfolioCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PortfolioCategorySchema.pre('save', function(next){
  if (this.isModified('name') || !this.slug){
    this.slug = String(this.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g,'')
      .trim()
      .replace(/\s+/g,'-');
  }
  next();
});

module.exports = mongoose.model('PortfolioCategory', PortfolioCategorySchema);
