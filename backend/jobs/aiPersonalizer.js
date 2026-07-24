const cron = require('node-cron');
const AIPersonalization = require('../models/AIPersonalization');
const EmailCampaign = require('../models/EmailCampaign');
const EmailRecipient = require('../models/EmailRecipient');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

class AIPersonalizerJob {

  constructor() {
    // Get configuration from environment
    this.schedule = process.env.AI_PERSONALIZER_SCHEDULE || '*/5 * * * *';
    this.batchSize = parseInt(process.env.AI_PERSONALIZER_BATCH_SIZE) || 10;
    this.enabled = process.env.ENABLE_JOBS !== 'false';
    this.timezone = process.env.JOB_TIMEZONE || 'UTC';
  }

  /**
   * Start AI personalization job
   */
  start() {
    if (!this.enabled) {
      logger.info('AI Personalizer job is disabled');
      return;
    }

    cron.schedule(this.schedule, async () => {
      try {
        logger.info('AI Personalizer job started');
        await this.processPersonalizationQueue();
      } catch (error) {
        logger.error('AI Personalizer job failed', { error: error.message });
      }
    }, {
      timezone: this.timezone
    });

    logger.info(`✅ AI Personalizer job scheduled: ${this.schedule} (${this.timezone})`);
    logger.info(`   Batch size: ${this.batchSize} requests per run`);
  }

  /**
   * Process pending personalization requests
   */
  async processPersonalizationQueue() {
    try {
      const pendingRequests = await AIPersonalization.find({
        status: 'pending'
      })
        .populate('campaign')
        .populate('recipient')
        .limit(this.batchSize);

      if (pendingRequests.length === 0) {
        logger.info('No pending AI personalization requests');
        return;
      }

      logger.info(`Processing ${pendingRequests.length} AI personalization requests`);

      const chunkSize = 5;
      for (let i = 0; i < pendingRequests.length; i += chunkSize) {
        const chunk = pendingRequests.slice(i, i + chunkSize);
        
        // Process requests sequentially within the chunk
        for (const request of chunk) {
          await this.generatePersonalizedContent(request);
        }
        
        // If there are more chunks to process, wait 10 seconds before continuing
        if (i + chunkSize < pendingRequests.length) {
           logger.info(`Processed chunk, waiting 10 seconds before next to prevent rate limits...`);
           await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      logger.info('AI personalization batch completed');

    } catch (error) {
      logger.error('Error processing personalization queue', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate personalized content for a single request
   */
  async generatePersonalizedContent(personalization) {
    try {
      const { recipient, campaign } = personalization;

      logger.info('Generating AI content', {
        recipientId: recipient._id,
        campaignId: campaign._id
      });

      const inputData = {
        recipientInfo: {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          company: recipient.company,
          jobTitle: recipient.jobTitle,
          industry: recipient.customFields?.industry,
          ...recipient.customFields
        },
        templateUsed: personalization.inputData?.templateUsed,
        campaignName: campaign.name,
        campaignGoal: campaign.goal
      };

      const startTime = Date.now();
      const aiResult = await aiService.generateEmailContent(inputData);
      const processingTime = Date.now() - startTime;

      personalization.generatedContent = {
        subject: aiResult.subject,
        body: aiResult.body,
        previewText: aiResult.previewText,
        callToAction: aiResult.callToAction
      };

      personalization.aiMetadata = {
        tokensUsed: aiResult.tokensUsed,
        processingTime,
        confidence: aiResult.confidence,
        temperature: aiResult.temperature,
        maxTokens: aiResult.maxTokens
      };

      personalization.qualityScore = this.calculateQualityScore(aiResult);
      personalization.status = 'generated';

      await personalization.save();

      logger.info('AI content generated successfully', {
        recipientId: recipient._id,
        qualityScore: personalization.qualityScore
      });

    } catch (error) {
      logger.error('AI content generation failed', {
        personalizationId: personalization._id,
        error: error.message
      });

      personalization.error = {
        occurred: true,
        message: error.message,
        timestamp: new Date()
      };
      personalization.status = 'pending';
      await personalization.save();
    }
  }

  /**
   * Calculate quality score for generated content
   */
  calculateQualityScore(aiResult) {
    let score = 0;

    score += (aiResult.confidence || 70);

    if (aiResult.personalizationElements > 3) score += 10;
    if (aiResult.personalizationElements > 5) score += 10;

    if (aiResult.body && aiResult.body.length < 200) score -= 10;

    if (aiResult.callToAction) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Process campaigns that need AI personalization
   */
  async processCampaignPersonalization(campaignId) {
    try {
      const campaign = await EmailCampaign.findById(campaignId)
        .populate('lists');

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const recipientIds = [];
      for (const list of campaign.lists) {
        const listRecipients = await EmailRecipient.find({
          lists: list._id,
          verificationStatus: 'valid'
        });
        recipientIds.push(...listRecipients.map(r => r._id));
      }

      const personalizations = recipientIds.map(recipientId => ({
        campaign: campaignId,
        recipient: recipientId,
        provider: 'openai',
        model: 'gpt-4',
        inputData: {
          templateUsed: campaign.template?.name
        },
        status: 'pending',
        createdBy: campaign.createdBy
      }));

      await AIPersonalization.insertMany(personalizations);

      logger.info('Created AI personalization requests', {
        campaignId,
        count: personalizations.length
      });

    } catch (error) {
      logger.error('Campaign personalization setup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Retry failed personalizations
   */
  async retryFailedPersonalizations() {
    try {
      const failedRequests = await AIPersonalization.find({
        'error.occurred': true,
        status: 'pending'
      }).limit(5);

      for (const request of failedRequests) {
        await this.generatePersonalizedContent(request);
      }

      logger.info(`Retried ${failedRequests.length} failed personalizations`);

    } catch (error) {
      logger.error('Retry failed', { error: error.message });
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      schedule: this.schedule,
      batchSize: this.batchSize,
      timezone: this.timezone,
      nextRun: this.getNextRun()
    };
  }

  /**
   * Get next run time (approximate)
   */
  getNextRun() {
    // This is approximate based on schedule
    const scheduleType = this.schedule.split(' ')[0];
    if (scheduleType.includes('*/')) {
      const minutes = parseInt(scheduleType.replace('*/', ''));
      return `Every ${minutes} minutes`;
    }
    return 'Based on cron schedule';
  }
}

const aiPersonalizerJob = new AIPersonalizerJob();

if (process.env.NODE_ENV !== 'test') {
  aiPersonalizerJob.start();
}

module.exports = aiPersonalizerJob;