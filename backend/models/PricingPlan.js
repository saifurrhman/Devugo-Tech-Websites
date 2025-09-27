const mongoose = require('mongoose');

const PricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, index: true },
    priceMonthly: { type: Number, default: 0 },
    priceYearly: { type: Number, default: 0 },
    features: [String],
    recommended: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Option A: single Service per plan (optional)
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', index: true, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingPlan', PricingPlanSchema);
