module.exports = {
  // n8n Webhook Configuration
  webhookUrl: process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook',
  apiKey: process.env.N8N_API_KEY || '',
  
  // Webhook endpoints
  endpoints: {
    emailReceived: '/webhook/email-received',
    leadCreated: '/webhook/lead-created',
    campaignCompleted: '/webhook/campaign-completed',
    invoicePaid: '/webhook/invoice-paid',
    meetingScheduled: '/webhook/meeting-scheduled'
  },
  
  // Request timeout
  timeout: 30000,
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000
  }
};