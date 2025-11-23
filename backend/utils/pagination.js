class Pagination {

  /**
   * Get pagination parameters
   */
  getParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100); // Max 100
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip
    };
  }

  /**
   * Create pagination response
   */
  createResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    };
  }

  /**
   * Paginate query
   */
  async paginate(query, Model, page = 1, limit = 20, populate = null, sort = null) {
    const skip = (page - 1) * limit;

    let queryBuilder = Model.find(query).skip(skip).limit(limit);

    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(p => queryBuilder = queryBuilder.populate(p));
      } else {
        queryBuilder = queryBuilder.populate(populate);
      }
    }

    if (sort) {
      queryBuilder = queryBuilder.sort(sort);
    }

    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      Model.countDocuments(query)
    ]);

    return this.createResponse(data, total, page, limit);
  }

  /**
   * Create pagination links (for REST APIs)
   */
  createLinks(baseUrl, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const links = {
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`
    };

    if (page > 1) {
      links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    }

    if (page < totalPages) {
      links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }

    return links;
  }
}

module.exports = new Pagination();