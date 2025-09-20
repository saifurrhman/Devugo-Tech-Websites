// Placeholder blog controller CRUD
exports.list = async (req, res) => res.json({ posts: [] });
exports.get = async (req, res) => res.json({ post: { id: req.params.slug || req.params.id } });
exports.create = async (req, res) => res.status(201).json({ post: req.body });
exports.update = async (req, res) => res.json({ post: { id: req.params.id, ...req.body } });
exports.remove = async (req, res) => res.status(204).end();
