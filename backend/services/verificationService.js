const axios = require('axios');
const dns = require('dns').promises;
const logger = require('../utils/logger');

class VerificationService {

  async verifyEmail(email) {
    try {
      const result = {
        email,
        isValid: false,
        isSyntaxValid: false,
        isDomainValid: false,
        isMxValid: false,
        isDisposable: false,
        reason: ''
      };

      // 1. Syntax validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      result.isSyntaxValid = emailRegex.test(email);

      if (!result.isSyntaxValid) {
        result.reason = 'Invalid email syntax';
        return result;
      }

      // 2. Extract domain
      const domain = email.split('@')[1];

      // 3. Check if disposable email
      result.isDisposable = await this.isDisposableEmail(domain);

      if (result.isDisposable) {
        result.reason = 'Disposable email address';
        return result;
      }

      // 4. Check MX records
      try {
        const mxRecords = await dns.resolveMx(domain);
        result.isMxValid = mxRecords && mxRecords.length > 0;
        result.isDomainValid = true;
      } catch (error) {
        result.isMxValid = false;
        result.isDomainValid = false;
        result.reason = 'Domain does not exist or has no MX records';
        return result;
      }

      // All checks passed
      result.isValid = result.isSyntaxValid && result.isDomainValid && result.isMxValid && !result.isDisposable;

      if (result.isValid) {
        result.reason = 'Valid email';
      }

      return result;

    } catch (error) {
      logger.error('Email verification error:', error.message);
      return {
        email,
        isValid: false,
        reason: 'Verification failed: ' + error.message
      };
    }
  }

  async isDisposableEmail(domain) {
    // Common disposable email domains
    const disposableDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com',
      'trashmail.com',
      'temp-mail.org'
    ];

    return disposableDomains.includes(domain.toLowerCase());
  }

  async verifyBulkEmails(emails) {
    const results = [];

    for (const email of emails) {
      const result = await this.verifyEmail(email);
      results.push(result);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  async checkDomainReputation(domain) {
    try {
      // This would integrate with email reputation services
      // For now, return basic check
      return {
        domain,
        hasReputation: true,
        score: 80
      };
    } catch (error) {
      logger.error('Check domain reputation error:', error.message);
      return null;
    }
  }
}

module.exports = new VerificationService();