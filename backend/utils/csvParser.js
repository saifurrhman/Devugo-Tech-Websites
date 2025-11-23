const csv = require('csv-parser');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

class CSVParser {
  
  /**
   * Parse CSV file to array of objects
   */
  async parseFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parse CSV with validation
   */
  async parseWithValidation(filePath, requiredFields = []) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let rowNumber = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          rowNumber++;
          
          // Validate required fields
          const missingFields = requiredFields.filter(field => !data[field]);
          
          if (missingFields.length > 0) {
            errors.push({
              row: rowNumber,
              data,
              error: `Missing required fields: ${missingFields.join(', ')}`
            });
          } else {
            results.push(data);
          }
        })
        .on('end', () => {
          resolve({
            success: true,
            total: rowNumber,
            valid: results.length,
            invalid: errors.length,
            data: results,
            errors
          });
        })
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Write array to CSV file
   */
  async writeToFile(data, filePath, headers) {
    try {
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: headers
      });

      await csvWriter.writeRecords(data);
      return { success: true, path: filePath };
    } catch (error) {
      throw new Error(`CSV write error: ${error.message}`);
    }
  }

  /**
   * Convert JSON to CSV string
   */
  jsonToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Clean CSV data
   */
  cleanData(data) {
    return data.map(row => {
      const cleaned = {};
      for (const [key, value] of Object.entries(row)) {
        // Trim whitespace
        const cleanKey = key.trim();
        const cleanValue = typeof value === 'string' ? value.trim() : value;
        cleaned[cleanKey] = cleanValue;
      }
      return cleaned;
    });
  }

  /**
   * Validate CSV structure
   */
  async validateStructure(filePath, expectedHeaders) {
    return new Promise((resolve, reject) => {
      let headers = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList.map(h => h.trim());
        })
        .on('end', () => {
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          const extraHeaders = headers.filter(h => !expectedHeaders.includes(h));
          
          resolve({
            isValid: missingHeaders.length === 0,
            headers,
            expectedHeaders,
            missingHeaders,
            extraHeaders
          });
        })
        .on('error', (error) => reject(error));
    });
  }
}

module.exports = new CSVParser();