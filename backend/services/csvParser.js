const csv = require('csv-parser');
const fs = require('fs');
const EmailRecipient = require('../models/EmailRecipient');

/**
 * Parse CSV file and save recipients to database
 */
exports.parseAndSaveCSV = async (filePath, userId) => {
  const results = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean and validate data
        if (data.email && data.email.trim()) {
          results.push({
            email: data.email.trim().toLowerCase(),
            name: data.name ? data.name.trim() : '',
            firstName: data.firstName ? data.firstName.trim() : '',
            lastName: data.lastName ? data.lastName.trim() : '',
            company: data.company ? data.company.trim() : '',
            phone: data.phone ? data.phone.trim() : '',
            customFields: data,
            source: 'csv_upload',
            addedBy: userId
          });
        }
      })
      .on('end', async () => {
        try {
          const savedRecipients = [];
          
          // Save each recipient, skip duplicates
          for (const recipient of results) {
            try {
              const existing = await EmailRecipient.findOne({ email: recipient.email });
              
              if (existing) {
                // Update existing recipient
                Object.assign(existing, recipient);
                await existing.save();
                savedRecipients.push(existing);
              } else {
                // Create new recipient
                const newRecipient = await EmailRecipient.create(recipient);
                savedRecipients.push(newRecipient);
              }
            } catch (err) {
              errors.push({
                email: recipient.email,
                error: err.message
              });
            }
          }

          // Delete the uploaded file
          fs.unlinkSync(filePath);

          resolve({
            success: true,
            total: results.length,
            saved: savedRecipients.length,
            errors: errors.length,
            recipients: savedRecipients,
            errorDetails: errors
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Validate CSV format
 */
exports.validateCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const headers = [];
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        headers.push(...headerList);
      })
      .on('data', () => {
        rowCount++;
      })
      .on('end', () => {
        const hasEmail = headers.includes('email');
        
        resolve({
          isValid: hasEmail,
          headers,
          rowCount,
          missingRequired: hasEmail ? [] : ['email']
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Export recipients to CSV
 */
exports.exportToCSV = async (recipients) => {
  const csvData = recipients.map(r => ({
    email: r.email,
    name: r.name,
    firstName: r.firstName,
    lastName: r.lastName,
    company: r.company,
    phone: r.phone,
    status: r.status,
    tags: r.tags.join(', '),
    createdAt: r.createdAt
  }));

  return csvData;
};