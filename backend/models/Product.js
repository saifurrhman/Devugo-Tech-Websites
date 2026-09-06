const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true, unique: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: 'SaaS', index: true },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    badge: { type: String, default: '' }, // e.g. 'Featured', 'Hot', 'Popular', 'New', 'Pro'
    features: [{ type: String }],
    techStack: [{ type: String }],
    image: { type: String, default: '' },
    gallery: [{ type: String }],
    demoUrl: { type: String, default: '' },
    buyUrl: { type: String, default: '' },
    documentationUrl: { type: String, default: '' },
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
