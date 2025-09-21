const BlogPost = require('../models/BlogPost');

exports.list = async (req, res) => {
  try{
    const posts = await BlogPost.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 });
    res.json({ posts });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.get = async (req, res) => {
  try{
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if(!post) return res.status(404).json({ error: 'Not found' });
    res.json({ post });
  }catch(err){
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.create = async (req, res) => {
  try{
    const { title, excerpt, content, coverImage, tags, published } = req.body;
    const slug = (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const post = await BlogPost.create({
      title, excerpt, content, coverImage, tags, published: !!published,
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
