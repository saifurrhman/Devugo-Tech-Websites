const Joi = require('joi');
const campaignValidator = require('./campaignValidator');
const invoiceValidator = require('./invoiceValidator');
const projectValidator = require('./projectValidator');

/**
 * Validation middleware factory
 * Usage: router.post('/api/campaigns', validate(campaignValidator.createCampaign), controller)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,      // Show all errors, not just first
      stripUnknown: true      // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Attach validated data to request
    req.validatedData = value;
    next();
  };
};

/**
 * Query params validation middleware
 * Usage: router.get('/api/campaigns', validateQuery(querySchema), controller)
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    req.validatedQuery = value;
    next();
  };
};

/**
 * URL params validation middleware
 * Usage: router.get('/api/campaigns/:id', validateParams(paramsSchema), controller)
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      });
    }

    req.validatedParams = value;
    next();
  };
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  // MongoDB ObjectId validation
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  
  // Email validation
  email: Joi.string().email().lowercase().trim(),
  
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate'))
  })
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  commonSchemas,
  campaignValidator,
  invoiceValidator,
  projectValidator
};