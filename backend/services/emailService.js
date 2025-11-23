const nodemailer = require('nodemailer');
const smtpConfig = require('../config/smtp');
const logger = require('../utils/logger');

let transporter = null;

// Create transporter only if SMTP is enabled and credentials exist
function createTransporter() {
  try {
    // Check if SMTP is enabled and has credentials
    if (!smtpConfig.smtp.enabled) {
      logger.info('SMTP is disabled');
      return null;
    }

    // Check if credentials exist
    if (!smtpConfig.smtp.auth.user || !smtpConfig.smtp.auth.pass) {
      logger.warn('SMTP credentials missing - email sending disabled');
      return null;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtp.host,
      port: smtpConfig.smtp.port,
      secure: smtpConfig.smtp.secure,
      auth: smtpConfig.smtp.auth
    });

    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter error:', error);
      } else {
        logger.info('✅ Email server is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    logger.error('Failed to create email transporter:', error.message);
    return null;
  }
}

// Initialize transporter
transporter = createTransporter();

class EmailService {
  async sendEmail(emailData) {
    try {
      // Check if transporter is available
      if (!transporter) {
        logger.warn('Email transporter not available - email not sent');
        return {
          success: false,
          message: 'Email service not configured'
        };
      }

      const mailOptions = {
        from: `${smtpConfig.smtp.from.name} <${smtpConfig.smtp.from.email}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments || []
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        to: emailData.to,
        messageId: result.messageId
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      logger.error('Email sending failed', {
        error: error.message,
        to: emailData.to
      });

      return {
        success: false,
        message: error.message
      };
    }
  }

  async sendBulkEmails(emails) {
    const results = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);

      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  async sendCampaign(campaign) {
    try {
      if (!transporter) {
        logger.warn('Email transporter not available');
        return { success: false, message: 'Email service not configured' };
      }

      const recipients = campaign.recipients || [];
      const template = campaign.template;
      const results = [];

      logger.info(`Starting campaign: ${campaign.name} to ${recipients.length} recipients`);

      for (const recipient of recipients) {
        try {
          const personalizedContent = this.personalize(template.html, {
            firstName: recipient.firstName || '',
            lastName: recipient.lastName || '',
            email: recipient.email,
            company: recipient.company || '',
            name: recipient.name || `${recipient.firstName} ${recipient.lastName}`
          });

          const trackingPixel = `<img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/tracking/pixel/${recipient._id}" width="1" height="1" style="display:none;" />`;

          const emailData = {
            to: recipient.email,
            subject: this.personalize(template.subject, recipient),
            html: personalizedContent + trackingPixel,
            text: this.stripHtml(personalizedContent)
          };

          const result = await this.sendEmail(emailData);
          results.push({ 
            recipient: recipient.email, 
            success: result.success,
            messageId: result.messageId 
          });

          // Rate limiting - 1 second between emails
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error(`Failed to send to ${recipient.email}:`, error.message);
          results.push({ 
            recipient: recipient.email, 
            success: false, 
            error: error.message 
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      logger.info(`Campaign completed: ${successCount}/${recipients.length} sent successfully`);

      return { 
        success: true, 
        results,
        total: recipients.length,
        sent: successCount,
        failed: recipients.length - successCount
      };
    } catch (error) {
      logger.error('Send campaign error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async sendCampaignEmail(campaign, recipient, template) {
    try {
      const personalizedContent = this.personalize(template.html, {
        firstName: recipient.firstName || '',
        lastName: recipient.lastName || '',
        email: recipient.email,
        company: recipient.company || '',
        name: recipient.name || `${recipient.firstName} ${recipient.lastName}`
      });

      const trackingPixel = `<img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/tracking/pixel/${recipient._id}" width="1" height="1" style="display:none;" />`;
      
      const emailData = {
        to: recipient.email,
        subject: this.personalize(template.subject, recipient),
        html: personalizedContent + trackingPixel,
        text: this.stripHtml(personalizedContent)
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      logger.error('Send campaign email error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async sendTransactionalEmail(type, recipientEmail, data) {
    try {
      const templates = {
        welcome: {
          subject: 'Welcome to Devugo Tech!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Welcome ${data.name}!</h1>
              <p>Thank you for joining Devugo Tech. We're excited to have you on board!</p>
              <p>Get started by exploring our platform.</p>
            </div>
          `
        },
        invoiceCreated: {
          subject: `Invoice ${data.invoiceNumber} Created`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Invoice Created</h1>
              <p>Invoice <strong>#${data.invoiceNumber}</strong> for <strong>$${data.amount}</strong> has been created.</p>
              <p>Due Date: ${data.dueDate}</p>
              <a href="${data.invoiceLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Invoice</a>
            </div>
          `
        },
        meetingScheduled: {
          subject: `Meeting Scheduled: ${data.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Meeting Scheduled</h1>
              <p><strong>${data.title}</strong></p>
              <p>Date: ${data.date}</p>
              <p>Time: ${data.time}</p>
              <a href="${data.link}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Join Meeting</a>
            </div>
          `
        },
        passwordReset: {
          subject: 'Password Reset Request',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Reset Your Password</h1>
              <p>You requested to reset your password. Click the button below to continue.</p>
              <a href="${data.resetLink}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
          `
        },
        verification: {
          subject: 'Verify Your Email Address',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333;">Verify Your Email</h1>
              <p>Please verify your email address by clicking the button below.</p>
              <a href="${data.verificationLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify Email</a>
            </div>
          `
        }
      };

      const template = templates[type];
      if (!template) {
        throw new Error(`Unknown email type: ${type}`);
      }

      return await this.sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
        text: this.stripHtml(template.html)
      });
    } catch (error) {
      logger.error('Send transactional email error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  personalize(content, data) {
    if (!content) return '';
    
    let personalized = content;

    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalized = personalized.replace(regex, data[key] || '');
    });

    return personalized;
  }

  stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  isAvailable() {
    return transporter !== null;
  }
}

module.exports = new EmailService();