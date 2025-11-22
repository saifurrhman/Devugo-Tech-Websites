const Joi = require('joi');

const campaignValidators = {
  
  createCampaign: Joi.object({
    name: Joi.string().required().min(3).max(100),
    subject: Joi.string().required().min(5).max(200),
    template: Joi.string().required(),
    lists: Joi.array().items(Joi.string()).min(1).required(),
    schedule: Joi.object({
      scheduledFor: Joi.date().min('now'),
      timezone: Joi.string().default('UTC')
    }),
    status: Joi.string().valid('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'),
    settings: Joi.object({
      trackOpens: Joi.boolean().default(true),
      trackClicks: Joi.boolean().default(true),
      enableAI: Joi.boolean().default(false)
    })
  }),

  updateCampaign: Joi.object({
    name: Joi.string().min(3).max(100),
    subject: Joi.string().min(5).max(200),
    status: Joi.string().valid('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'),
    settings: Joi.object()
  })
};

module.exports = campaignValidators;