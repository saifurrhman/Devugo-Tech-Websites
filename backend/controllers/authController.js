// Placeholder auth controller
exports.login = async (req, res) => {
  return res.json({ message: 'login placeholder' });
};

exports.getMe = async (req, res) => {
  return res.json({ user: { id: 'admin', role: 'admin' } });
};
