// Placeholder analytics controller
exports.capture = async (req, res) => res.status(202).json({ received: true });
exports.metrics = async (req, res) => res.json({ traffic: [], attribution: [] });
