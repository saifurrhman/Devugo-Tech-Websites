const BlogPost = require('../models/BlogPost');

exports.list = async (req, res) => {
  try{
    const isAdminAll = (req.query.all === '1' || req.query.all === 'true') && (req.user || req.isAdmin); // basic check
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '9', 10), 1), 50);
    const categorySlug = req.query.category;

    const filter = isAdminAll ? {} : { published: true };
    if (categorySlug) {
      // filter posts by category slug
      const BlogCategory = require('../models/BlogCategory');
      const cat = await BlogCategory.findOne({ slug: categorySlug });
      if (cat) filter.categories = cat._id; else filter.categories = null; // no results if missing
    }

    const total = await BlogPost.countDocuments(filter);
    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('categories');
    res.json({ posts, page, total, pages: Math.ceil(total / limit) });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.get = async (req, res) => {
  try{
    const { id } = req.params;
    const { slug } = req.query;
    const post = slug
      ? await BlogPost.findOne({ slug }).populate('categories')
      : await BlogPost.findById(id).populate('categories');
    if(!post) return res.status(404).json({ error: 'Not found' });
    res.json({ post });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.create = async (req, res) => {
  try{
    const { title, excerpt, content, coverImage, featuredImage, galleryImages, featured, tags, published, seo } = req.body || {};
    const slug = (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const post = await BlogPost.create({
      title,
      excerpt,
      content,
      coverImage,
      featuredImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      featured: !!featured,
      tags,
      seo: seo ? {
        metaTitle: seo.metaTitle || '',
        metaDescription: seo.metaDescription || '',
        metaKeywords: Array.isArray(seo.metaKeywords) ? seo.metaKeywords : (seo.metaKeywords ? String(seo.metaKeywords).split(',').map(s=>s.trim()).filter(Boolean) : []),
      } : undefined,
      published: !!published,
      slug,
      publishedAt: published ? new Date() : undefined,
    });
    res.status(201).json({ post });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  try{
    const { id } = req.params;
    const payload = req.body || {};
    if (typeof payload.title === 'string') {
      payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    }
    if (payload.published && !payload.publishedAt) payload.publishedAt = new Date();
    if (payload.seo) {
      payload.seo = {
        metaTitle: payload.seo.metaTitle || '',
        metaDescription: payload.seo.metaDescription || '',
        metaKeywords: Array.isArray(payload.seo.metaKeywords) ? payload.seo.metaKeywords : (payload.seo.metaKeywords ? String(payload.seo.metaKeywords).split(',').map(s=>s.trim()).filter(Boolean) : []),
      };
    }
    if (payload.galleryImages && !Array.isArray(payload.galleryImages)) {
      payload.galleryImages = [];
    }
    const post = await BlogPost.findByIdAndUpdate(id, payload, { new: true });
    if(!post) return res.status(404).json({ error: 'Not found' });
    res.json({ post });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.remove = async (req, res) => {
  try{
    const { id } = req.params;
    await BlogPost.findByIdAndDelete(id);
    res.status(204).end();
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
