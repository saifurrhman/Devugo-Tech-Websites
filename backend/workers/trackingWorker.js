const Queue = require('bull');
const EmailTracking = require('../models/EmailTracking');
const EmailRecipient = require('../models/EmailRecipient');
const logger = require('../utils/logger');

// Create tracking queue
const trackingQueue = new Queue('email-tracking', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Process tracking jobs
trackingQueue.process(async (job) => {
  const { eventType, data } = job.data;
  
  try {
    logger.info('Processing tracking event', { eventType, messageId: data.messageId });

    const tracking = await EmailTracking.findOne({ messageId: data.messageId });
    
    if (!tracking) {
      logger.warn('Tracking record not found', { messageId: data.messageId });
      return { success: false, reason: 'Tracking not found' };
    }

    // Add event to tracking
    tracking.addEvent({
      type: eventType,
      timestamp: new Date(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      linkUrl: data.linkUrl,
      bounceReason: data.bounceReason,
      bounceType: data.bounceType
    });

    await tracking.save();

    // Update recipient stats
    await updateRecipientStats(tracking.recipient, eventType);

    logger.info('Tracking event processed', { eventType, messageId: data.messageId });
    
    return { success: true };

  } catch (error) {
    logger.error('Tracking processing failed', { error: error.message });
    throw error;
  }
});

/**
 * Update recipient statistics
 */
async function updateRecipientStats(recipientId, eventType) {
  const updateData = {};
  
  switch (eventType) {
    case 'opened':
      updateData.$inc = { 'stats.emailsOpened': 1 };
      updateData.$set = { 'stats.lastOpened': new Date() };
      break;
    case 'clicked':
      updateData.$inc = { 'stats.emailsClicked': 1 };
      updateData.$set = { 'stats.lastClicked': new Date() };
      break;
    case 'replied':
      updateData.$inc = { 'stats.emailsReplied': 1 };
      updateData.$set = { 'stats.lastReplied': new Date() };
      break;
    case 'bounced':
      updateData.$inc = { 'stats.emailsBounced': 1 };
      break;
  }

  if (Object.keys(updateData).length > 0) {
    await EmailRecipient.findByIdAndUpdate(recipientId, updateData);
  }
}

// Event handlers
trackingQueue.on('completed', (job, result) => {
  logger.info('Tracking job completed', { jobId: job.id });
});

trackingQueue.on('failed', (job, error) => {
  logger.error('Tracking job failed', { jobId: job.id, error: error.message });
});

module.exports = trackingQueue; 