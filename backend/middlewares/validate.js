// Request validation middleware placeholder
module.exports = (schema) => async (req, res, next) => {
  try {
    if (!schema) return next();
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    res.status(400).json({ message: 'Validation failed', details: err.details });
  }
};
