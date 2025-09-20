// Placeholder portfolio controller CRUD
exports.list = async (req, res) => res.json({ items: [] });
exports.get = async (req, res) => res.json({ item: { id: req.params.id } });
exports.create = async (req, res) => res.status(201).json({ item: req.body });
exports.update = async (req, res) => res.json({ item: { id: req.params.id, ...req.body } });
exports.remove = async (req, res) => res.status(204).end();
