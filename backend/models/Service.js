const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, index: true },
    description: String,
    features: [String],
    icon: String,
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Option B: link many plans to a service
    pricingRelations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PricingPlan' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
