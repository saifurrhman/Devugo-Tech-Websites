const dns = require('dns').promises;

class EmailValidator {

  /**
   * Basic email syntax validation
   */
  isValidSyntax(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate email format with detailed checks
   */
  validate(email) {
    const result = {
      isValid: false,
      email: email,
      errors: []
    };

    // Check if email is provided
    if (!email) {
      result.errors.push('Email is required');
      return result;
    }

    // Convert to lowercase and trim
    email = email.toLowerCase().trim();
    result.email = email;

    // Check length
    if (email.length > 254) {
      result.errors.push('Email is too long (max 254 characters)');
    }

    // Check for multiple @ symbols
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
      result.errors.push('Email must contain exactly one @ symbol');
      return result;
    }

    // Split email into local and domain parts
    const [localPart, domain] = email.split('@');

    // Validate local part
    if (!localPart || localPart.length === 0) {
      result.errors.push('Email local part is empty');
    } else if (localPart.length > 64) {
      result.errors.push('Email local part is too long (max 64 characters)');
    } else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      result.errors.push('Email local part contains invalid characters');
    }

    // Validate domain
    if (!domain || domain.length === 0) {
      result.errors.push('Email domain is empty');
    } else if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      result.errors.push('Email domain is invalid');
    }

    // Check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const typos = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com'
    };

    if (domain && typos[domain]) {
      result.errors.push(`Did you mean ${typos[domain]}?`);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Check if email domain has MX records
   */
  async hasMXRecords(email) {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;

      const mxRecords = await dns.resolveMx(domain);
      return mxRecords && mxRecords.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if email is from a disposable email service
   */
  isDisposable(email) {
    const domain = email.split('@')[1];
    const disposableDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      '10minutemail.com',
      'mailinator.com',
      'trashmail.com',
      'temp-mail.org',
      'fakeinbox.com',
      'maildrop.cc'
    ];

    return disposableDomains.includes(domain);
  }

  /**
   * Comprehensive email validation
   */
  async validateComprehensive(email) {
    const syntaxResult = this.validate(email);
    
    if (!syntaxResult.isValid) {
      return {
        ...syntaxResult,
        hasMX: false,
        isDisposable: false
      };
    }

    const [hasMX, isDisposable] = await Promise.all([
      this.hasMXRecords(email),
      Promise.resolve(this.isDisposable(email))
    ]);

    return {
      ...syntaxResult,
      hasMX,
      isDisposable,
      isValid: syntaxResult.isValid && hasMX && !isDisposable
    };
  }

  /**
   * Validate bulk emails
   */
  async validateBulk(emails) {
    const results = [];

    for (const email of emails) {
      const result = await this.validateComprehensive(email);
      results.push(result);
    }

    return {
      total: emails.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      results
    };
  }

  /**
   * Sanitize email
   */
  sanitize(email) {
    if (!email) return '';
    return email.toLowerCase().trim();
  }
}

module.exports = new EmailValidator();