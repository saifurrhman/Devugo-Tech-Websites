// Pagination helper placeholder
module.exports = function paginate(query, { page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  return { ...query, skip, limit };
};
