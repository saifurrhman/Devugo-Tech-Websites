const Joi = require('joi');

const invoiceValidators = {
  
  createInvoice: Joi.object({
    client: Joi.string().required(),
    project: Joi.string(),
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().required(),
        quantity: Joi.number().min(0).required(),
        unitPrice: Joi.number().min(0).required()
      })
    ).min(1).required(),
    dueDate: Joi.date().min('now').required(),
    taxRate: Joi.number().min(0).max(100).default(0),
    discount: Joi.number().min(0).default(0),
    discountType: Joi.string().valid('percentage', 'fixed').default('fixed'),
    notes: Joi.string().allow(''),
    termsAndConditions: Joi.string().allow('')
  }),

  addPayment: Joi.object({
    amount: Joi.number().min(0.01).required(),
    paymentMethod: Joi.string().valid('cash', 'credit_card', 'bank_transfer', 'paypal', 'stripe', 'other').required(),
    transactionId: Joi.string(),
    notes: Joi.string().allow('')
  })
};

module.exports = invoiceValidators;