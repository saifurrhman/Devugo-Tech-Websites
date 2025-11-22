class EmailTemplateParser {
  
  /**
   * Parse email template and replace variables
   */
  parseTemplate(template, data) {
    let parsedHtml = template.html || '';
    let parsedText = template.text || '';
    let parsedSubject = template.subject || '';

    // Replace all variables
    const replacements = this.getReplacements(data);

    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      parsedHtml = parsedHtml.replace(regex, replacements[key] || '');
      parsedText = parsedText.replace(regex, replacements[key] || '');
      parsedSubject = parsedSubject.replace(regex, replacements[key] || '');
    });

    // Add tracking pixel
    if (data.trackingPixel) {
      parsedHtml = this.addTrackingPixel(parsedHtml, data.trackingPixel);
    }

    // Convert links to tracked links
    if (data.trackingLinks) {
      parsedHtml = this.addLinkTracking(parsedHtml, data.messageId);
    }

    // Add unsubscribe link
    if (data.unsubscribeLink) {
      parsedHtml = this.addUnsubscribeLink(parsedHtml, data.unsubscribeLink);
    }

    return {
      subject: parsedSubject,
      html: parsedHtml,
      text: parsedText
    };
  }

  /**
   * Get replacement values from data
   */
  getReplacements(data) {
    const recipient = data.recipient || {};
    
    return {
      firstName: recipient.firstName || '',
      lastName: recipient.lastName || '',
      fullName: recipient.fullName || `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
      email: recipient.email || '',
      company: recipient.company || '',
      jobTitle: recipient.jobTitle || '',
      phone: recipient.phone || '',
      
      // Campaign specific
      campaignName: data.campaignName || '',
      senderName: data.senderName || '',
      senderEmail: data.senderEmail || '',
      
      // Custom fields
      ...(recipient.customFields || {})
    };
  }

  /**
   * Add tracking pixel to HTML
   */
  addTrackingPixel(html, trackingUrl) {
    const pixel = `<img src="${trackingUrl}" width="1" height="1" style="display:none;" alt="" />`;
    
    // Try to add before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${pixel}</body>`);
    }
    
    // Otherwise append at the end
    return html + pixel;
  }

  /**
   * Add tracking to all links
   */
  addLinkTracking(html, messageId) {
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;
    
    return html.replace(linkRegex, (match, url) => {
      // Skip unsubscribe and tracking links
      if (url.includes('unsubscribe') || url.includes('tracking')) {
        return match;
      }

      // Create tracked URL
      const trackedUrl = `/api/tracking/click/${messageId}?url=${encodeURIComponent(url)}`;
      return match.replace(url, trackedUrl);
    });
  }

  /**
   * Add unsubscribe link
   */
  addUnsubscribeLink(html, unsubscribeUrl) {
    const unsubscribeText = `
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">
          Unsubscribe from these emails
        </a>
      </div>
    `;

    // Try to add before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${unsubscribeText}</body>`);
    }
    
    return html + unsubscribeText;
  }

  /**
   * Extract variables from template
   */
  extractVariables(template) {
    const variableRegex = /{{([^}]+)}}/g;
    const variables = new Set();
    
    const content = `${template.subject || ''} ${template.html || ''} ${template.text || ''}`;
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Validate template has all required variables
   */
  validateTemplate(template, requiredVariables = []) {
    const templateVariables = this.extractVariables(template);
    const missing = requiredVariables.filter(v => !templateVariables.includes(v));

    return {
      valid: missing.length === 0,
      missing,
      found: templateVariables
    };
  }

  /**
   * Generate preview with sample data
   */
  generatePreview(template) {
    const sampleData = {
      recipient: {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Acme Corp',
        jobTitle: 'CEO',
        phone: '+1234567890'
      },
      campaignName: 'Sample Campaign',
      senderName: 'Your Name',
      senderEmail: 'you@company.com'
    };

    return this.parseTemplate(template, sampleData);
  }

  /**
   * Convert HTML to plain text
   */
  htmlToText(html) {
    if (!html) return '';

    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }
}

module.exports = new EmailTemplateParser();