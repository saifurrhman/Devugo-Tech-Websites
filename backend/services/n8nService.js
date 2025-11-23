const axios = require('axios');
const logger = require('../utils/logger');

class N8NService {
  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl;
  }

  async triggerWorkflow(workflowName, data) {
    try {
      if (!this.enabled) {
        logger.warn('n8n not configured');
        return null;
      }

      const response = await axios.post(
        `${this.webhookUrl}/${workflowName}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      logger.info(`n8n workflow triggered: ${workflowName}`);
      return response.data;
    } catch (error) {
      logger.error(`n8n workflow error (${workflowName}):`, error.message);
      return null;
    }
  }

  async notifyNewLead(leadData) {
    return await this.triggerWorkflow('new-lead', {
      event: 'lead.created',
      lead: leadData,
      timestamp: new Date().toISOString()
    });
  }

  async notifyEmailOpened(emailData) {
    return await this.triggerWorkflow('email-opened', {
      event: 'email.opened',
      email: emailData,
      timestamp: new Date().toISOString()
    });
  }

  async notifyEmailClicked(clickData) {
    return await this.triggerWorkflow('email-clicked', {
      event: 'email.clicked',
      click: clickData,
      timestamp: new Date().toISOString()
    });
  }

  async notifyInvoiceCreated(invoiceData) {
    return await this.triggerWorkflow('invoice-created', {
      event: 'invoice.created',
      invoice: invoiceData,
      timestamp: new Date().toISOString()
    });
  }

  async notifyMeetingScheduled(meetingData) {
    return await this.triggerWorkflow('meeting-scheduled', {
      event: 'meeting.scheduled',
      meeting: meetingData,
      timestamp: new Date().toISOString()
    });
  }

  async syncContact(contactData) {
    return await this.triggerWorkflow('sync-contact', {
      event: 'contact.sync',
      contact: contactData,
      timestamp: new Date().toISOString()
    });
  }

  isConfigured() {
    return this.enabled;
  }
}

module.exports = new N8NService();