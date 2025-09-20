// Placeholder team controller CRUD
exports.list = async (req, res) => res.json({ members: [] });
exports.get = async (req, res) => res.json({ member: { id: req.params.id } });
exports.create = async (req, res) => res.status(201).json({ member: req.body });
exports.update = async (req, res) => res.json({ member: { id: req.params.id, ...req.body } });
exports.remove = async (req, res) => res.status(204).end();
