const mongoose = require('mongoose');

const TechnologySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      index: true, 
      unique: true 
    },
    icon: { 
      type: String, 
      default: '' 
    },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Database', 'AI & Automation', 'DevOps', 'CMS/E-commerce', 'Other'],
      default: 'Other'
    },
    description: { 
      type: String, 
      maxLength: 150,
      default: ''
    },
    proficiencyLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    websiteUrl: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    },
    status: { 
      type: Boolean, 
      default: true 
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

TechnologySchema.pre('save', function(next){
  if (this.isModified('name') || !this.slug){
    this.slug = String(this.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g,'')
      .trim()
      .replace(/\s+/g,'-');
  }
  next();
});

module.exports = mongoose.model('Technology', TechnologySchema);
