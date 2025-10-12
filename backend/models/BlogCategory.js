const mongoose = require('mongoose');

const BlogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

BlogCategorySchema.pre('validate', function(next){
  if (!this.slug && this.name){
    this.slug = String(this.name)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g,'')
      .trim()
      .replace(/\s+/g,'-');
  }
  next();
});

module.exports = mongoose.model('BlogCategory', BlogCategorySchema);
