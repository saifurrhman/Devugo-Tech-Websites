class ResponseHandler {
  
  success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  error(res, message = 'Error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors })
    });
  }

  created(res, data = null, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  noContent(res) {
    return res.status(204).end();
  }

  validationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message
    });
  }

  unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message
    });
  }

  forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      message
    });
  }

  // Keep existing simple helpers for backward compatibility
  ok(res, data) {
    return this.success(res, data);
  }
}

module.exports = new ResponseHandler();