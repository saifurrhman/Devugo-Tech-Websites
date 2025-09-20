// Response helpers placeholder
exports.ok = (res, data) => res.json(data);
exports.created = (res, data) => res.status(201).json(data);
exports.noContent = (res) => res.status(204).end();
