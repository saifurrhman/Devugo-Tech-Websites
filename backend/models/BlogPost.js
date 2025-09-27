const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    excerpt: String,
    content: String,
    coverImage: String,
    featuredImage: String,
    galleryImages: [String],
    featured: { type: Boolean, default: false },
    tags: [String],
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
    published: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('BlogPost', BlogPostSchema);
