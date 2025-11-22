const cron = require('node-cron');
const EmailCampaign = require('../models/EmailCampaign');
const EmailSchedule = require('../models/EmailSchedule');
const emailService = require('./emailService');

/**
 * Start the email scheduler
 * Runs every 1 minute to check for scheduled campaigns
 */
exports.startScheduler = () => {
  console.log('📅 Email Scheduler Started');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      await this.processScheduledCampaigns();
    } catch (error) {
      console.error('❌ Scheduler Error:', error);
    }
  });
};

/**
 * Process scheduled campaigns
 */
exports.processScheduledCampaigns = async () => {
  const now = new Date();

  // Find campaigns scheduled to run now
  const scheduledCampaigns = await EmailSchedule.find({
    status: 'pending',
    scheduledFor: { $lte: now }
  }).populate('campaign');

  if (scheduledCampaigns.length === 0) {
    return;
  }

  console.log(`📧 Processing ${scheduledCampaigns.length} scheduled campaigns`);

  for (const schedule of scheduledCampaigns) {
    try {
      // Update schedule status
      schedule.status = 'processing';
      schedule.lastRunAt = new Date();
      await schedule.save();

      // Get full campaign with recipients
      const campaign = await EmailCampaign.findById(schedule.campaign._id)
        .populate('recipients')
        .populate('template');

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Send the campaign
      await emailService.sendCampaign(campaign);

      // Update schedule
      schedule.status = 'completed';
      await schedule.save();

      console.log(`✅ Campaign ${campaign.name} sent successfully`);
    } catch (error) {
      console.error(`❌ Failed to send campaign:`, error);

      // Update schedule with error
      schedule.status = 'failed';
      schedule.error = error.message;
      schedule.retryCount += 1;
      await schedule.save();

      // Retry logic
      if (schedule.retryCount < schedule.maxRetries) {
        schedule.status = 'pending';
        schedule.scheduledFor = new Date(Date.now() + 5 * 60 * 1000); // Retry after 5 minutes
        await schedule.save();
      }
    }
  }
};

/**
 * Schedule a campaign
 */
exports.scheduleCampaign = async (campaignId, scheduledFor, userId) => {
  const schedule = await EmailSchedule.create({
    campaign: campaignId,
    scheduledFor: new Date(scheduledFor),
    createdBy: userId
  });

  // Update campaign status
  await EmailCampaign.findByIdAndUpdate(campaignId, {
    status: 'scheduled',
    scheduledAt: scheduledFor
  });

  return schedule;
};

/**
 * Cancel a scheduled campaign
 */
exports.cancelSchedule = async (scheduleId) => {
  const schedule = await EmailSchedule.findByIdAndUpdate(
    scheduleId,
    { status: 'cancelled' },
    { new: true }
  );

  // Update campaign status
  if (schedule) {
    await EmailCampaign.findByIdAndUpdate(schedule.campaign, {
      status: 'draft'
    });
  }

  return schedule;
};