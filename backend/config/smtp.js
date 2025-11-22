module.exports = {
  // Primary SMTP Configuration (SendGrid)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourcompany.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'Your Company',
    enabled: process.env.SENDGRID_ENABLED === 'true'
  },
  
  // Backup SMTP Configuration (SMTP)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    from: {
      email: process.env.SMTP_FROM_EMAIL || 'noreply@yourcompany.com',
      name: process.env.SMTP_FROM_NAME || 'Your Company'
    },
    enabled: process.env.SMTP_ENABLED === 'true'
  },
  
  // Email sending limits
  limits: {
    perHour: parseInt(process.env.EMAIL_LIMIT_PER_HOUR) || 100,
    perDay: parseInt(process.env.EMAIL_LIMIT_PER_DAY) || 1000,
    batchSize: parseInt(process.env.EMAIL_BATCH_SIZE) || 10
  },
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 5000 // ms
  },
  
  // Email tracking
  tracking: {
    enabled: true,
    trackingDomain: process.env.TRACKING_DOMAIN || 'https://your-domain.com'
  }
};