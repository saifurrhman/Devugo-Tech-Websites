const mongoose = require('mongoose');

const ClientReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    summary: { type: String, default: '' },
    avatar: { type: String, default: '' },
    featured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClientReview', ClientReviewSchema);
