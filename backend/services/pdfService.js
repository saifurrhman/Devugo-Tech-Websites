const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class PDFService {

  async generateInvoicePDF(invoice) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Invoice details
        doc.fontSize(10);
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, { align: 'right' });
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Client details
        doc.fontSize(12).text('Bill To:', { underline: true });
        doc.fontSize(10);
        doc.text(invoice.clientDetails.name || '');
        doc.text(invoice.clientDetails.email || '');
        doc.text(invoice.clientDetails.company || '');
        if (invoice.clientDetails.address) {
          doc.text(invoice.clientDetails.address.street || '');
          doc.text(`${invoice.clientDetails.address.city || ''}, ${invoice.clientDetails.address.state || ''} ${invoice.clientDetails.address.zipCode || ''}`);
        }
        doc.moveDown(2);

        // Items table
        const tableTop = doc.y;
        const itemX = 50;
        const descX = 150;
        const qtyX = 350;
        const priceX = 400;
        const amountX = 480;

        // Table header
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('#', itemX, tableTop);
        doc.text('Description', descX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Price', priceX, tableTop);
        doc.text('Amount', amountX, tableTop);
        
        doc.moveTo(itemX, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .stroke();

        // Table rows
        doc.font('Helvetica');
        let yPos = tableTop + 25;

        invoice.items.forEach((item, index) => {
          doc.text(index + 1, itemX, yPos);
          doc.text(item.description, descX, yPos, { width: 180 });
          doc.text(item.quantity.toString(), qtyX, yPos);
          doc.text(`$${item.unitPrice.toFixed(2)}`, priceX, yPos);
          doc.text(`$${item.amount.toFixed(2)}`, amountX, yPos);
          yPos += 30;
        });

        // Totals
        yPos += 20;
        const totalsX = 400;

        doc.fontSize(10);
        doc.text('Subtotal:', totalsX, yPos);
        doc.text(`$${invoice.subtotal.toFixed(2)}`, amountX, yPos);
        yPos += 20;

        if (invoice.taxAmount > 0) {
          doc.text(`Tax (${invoice.taxRate}%):`, totalsX, yPos);
          doc.text(`$${invoice.taxAmount.toFixed(2)}`, amountX, yPos);
          yPos += 20;
        }

        if (invoice.discount > 0) {
          doc.text('Discount:', totalsX, yPos);
          doc.text(`-$${invoice.discount.toFixed(2)}`, amountX, yPos);
          yPos += 20;
        }

        doc.font('Helvetica-Bold');
        doc.fontSize(12);
        doc.text('Total:', totalsX, yPos);
        doc.text(`$${invoice.total.toFixed(2)}`, amountX, yPos);

        // Footer
        if (invoice.notes) {
          doc.moveDown(3);
          doc.fontSize(10).font('Helvetica');
          doc.text('Notes:', { underline: true });
          doc.text(invoice.notes);
        }

        if (invoice.termsAndConditions) {
          doc.moveDown();
          doc.fontSize(10);
          doc.text('Terms & Conditions:', { underline: true });
          doc.text(invoice.termsAndConditions, { width: 500 });
        }

        doc.end();

      } catch (error) {
        logger.error('Generate invoice PDF error:', error.message);
        reject(error);
      }
    });
  }

  async generateReportPDF(reportData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(20).text(reportData.title, { align: 'center' });
        doc.moveDown();

        // Content
        doc.fontSize(12).text(reportData.content);

        doc.end();

      } catch (error) {
        logger.error('Generate report PDF error:', error.message);
        reject(error);
      }
    });
  }

  async savePDFToFile(pdfBuffer, filename) {
    try {
      const uploadDir = path.join(__dirname, '../public/uploads/pdfs');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, pdfBuffer);

      logger.info(`PDF saved: ${filename}`);
      return `/uploads/pdfs/${filename}`;
    } catch (error) {
      logger.error('Save PDF error:', error.message);
      throw error;
    }
  }
}

module.exports = new PDFService();