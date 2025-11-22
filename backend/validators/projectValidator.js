const Joi = require('joi');

const projectValidators = {
  
  createProject: Joi.object({
    title: Joi.string().required().min(3).max(200),
    description: Joi.string().allow(''),
    projectType: Joi.string().valid('web_development', 'mobile_app', 'design', 'marketing', 'consulting', 'other').default('web_development'),
    client: Joi.string().required(),
    status: Joi.string().valid('lead', 'proposal', 'negotiation', 'won', 'in_progress', 'on_hold', 'completed', 'cancelled').default('lead'),
    startDate: Joi.date(),
    expectedDelivery: Joi.date(),
    budget: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
      currency: Joi.string().default('USD')
    }),
    requirements: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
      })
    ),
    milestones: Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        dueDate: Joi.date(),
        payment: Joi.number().min(0)
      })
    ),
    assignedTo: Joi.array().items(Joi.string()),
    projectManager: Joi.string()
  }),

  updateMilestone: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    dueDate: Joi.date(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'delayed'),
    completedDate: Joi.date()
  })
};

module.exports = projectValidators;