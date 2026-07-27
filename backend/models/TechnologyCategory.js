const mongoose = require('mongoose');

const TechnologyCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      index: true,
      unique: true
    },
    order: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '' // Optional for badge color customization
    },
    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

TechnologyCategorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = String(this.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('TechnologyCategory', TechnologyCategorySchema);
