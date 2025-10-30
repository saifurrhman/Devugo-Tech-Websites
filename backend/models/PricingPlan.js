const mongoose = require('mongoose');

const PricingPlanSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    slug: { 
      type: String, 
      index: true,
      trim: true
    },
    
    planType: {
      type: String,
      enum: ['subscription', 'one-time', 'custom'],
      default: 'subscription'
    },
    priceMonthly: { 
      type: Number, 
      default: 0 
    },
    priceYearly: { 
      type: Number, 
      default: 0 
    },
    priceOneTime: {
      type: Number,
      default: 0
    },
    features: {
      type: [String],
      default: []
    },
    recommended: { 
      type: Boolean, 
      default: false 
    },
    published: { 
      type: Boolean, 
      default: true 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    
    service: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Service', 
      index: true, 
      default: null 
    },
    
    description: {
      type: String,
      default: ''
    }
  },
  { 
    timestamps: true 
  }
);


PricingPlanSchema.index({ published: 1, order: 1 });
PricingPlanSchema.index({ planType: 1 });


PricingPlanSchema.virtual('displayPrice').get(function() {
  if (this.planType === 'custom') return 'Custom';
  if (this.planType === 'one-time') return `$${this.priceOneTime || 0}`;
  if (this.priceMonthly) return `$${this.priceMonthly}/mo`;
  if (this.priceYearly) return `$${this.priceYearly}/yr`;
  return 'Contact Us';
});

module.exports = mongoose.model('PricingPlan', PricingPlanSchema);