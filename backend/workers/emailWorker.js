const Queue = require('bull');
const emailService = require('../services/emailService');
const EmailLog = require('../models/EmailLog');
const EmailTracking = require('../models/EmailTracking');
const logger = require('../utils/logger');

// Create email queue
const emailQueue = new Queue('email-sending', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Process email jobs
emailQueue.process(async (job) => {
  const { emailData } = job.data;
  
  try {
    logger.info('Processing email job', { jobId: job.id, recipient: emailData.to });

    // Send email
    const result = await emailService.sendEmail(emailData);

    // Create email log
    const emailLog = new EmailLog({
      campaign: emailData.campaignId,
      recipient: emailData.recipientId,
      template: emailData.templateId,
      subject: emailData.subject,
      body: emailData.html,
      sentAt: new Date(),
      status: 'sent',
      messageId: result.messageId
    });
    await emailLog.save();

    // Create tracking record
    const tracking = new EmailTracking({
      campaign: emailData.campaignId,
      recipient: emailData.recipientId,
      emailLog: emailLog._id,
      messageId: result.messageId,
      toEmail: emailData.to,
      fromEmail: emailData.from,
      subject: emailData.subject
    });
    
    tracking.addEvent({
      type: 'sent',
      timestamp: new Date()
    });
    
    await tracking.save();

    logger.info('Email sent successfully', { messageId: result.messageId });
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Email sending failed', { error: error.message, recipient: emailData.to });
    throw error;
  }
});

// Event handlers
emailQueue.on('completed', (job, result) => {
  logger.info('Email job completed', { jobId: job.id, result });
});

emailQueue.on('failed', (job, error) => {
  logger.error('Email job failed', { jobId: job.id, error: error.message });
});

module.exports = emailQueue;