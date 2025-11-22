class InvoiceTemplateGenerator {

  /**
   * Generate invoice HTML template
   */
  generateHTML(invoice) {
    const {
      invoiceNumber,
      issueDate,
      dueDate,
      clientDetails,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency,
      notes,
      termsAndConditions
    } = invoice;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; color: #2563eb; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .dates { font-size: 14px; color: #666; }
    .billing-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .billing-section { flex: 1; }
    .billing-section h3 { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #666; text-transform: uppercase; }
    .billing-section p { margin: 5px 0; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .items-table .text-right { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .totals-row.total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; margin-top: 12px; }
    .notes { margin-top: 40px; padding: 20px; background: #f9fafb; border-left: 4px solid #2563eb; }
    .notes h4 { margin-bottom: 10px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">YOUR COMPANY</div>
      <div class="invoice-info">
        <div class="invoice-number">INVOICE #${invoiceNumber}</div>
        <div class="dates">
          <div>Issue Date: ${this.formatDate(issueDate)}</div>
          <div>Due Date: ${this.formatDate(dueDate)}</div>
        </div>
      </div>
    </div>

    <!-- Billing Info -->
    <div class="billing-info">
      <div class="billing-section">
        <h3>From:</h3>
        <p><strong>Your Company Name</strong></p>
        <p>Your Address Line 1</p>
        <p>Your Address Line 2</p>
        <p>Email: your@company.com</p>
      </div>
      <div class="billing-section">
        <h3>Bill To:</h3>
        <p><strong>${clientDetails.name}</strong></p>
        ${clientDetails.company ? `<p>${clientDetails.company}</p>` : ''}
        <p>${clientDetails.email}</p>
        ${clientDetails.phone ? `<p>${clientDetails.phone}</p>` : ''}
        ${this.formatAddress(clientDetails.address)}
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${this.formatCurrency(item.unitPrice, currency)}</td>
            <td class="text-right">${this.formatCurrency(item.amount, currency)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>${this.formatCurrency(subtotal, currency)}</span>
      </div>
      ${discount > 0 ? `
        <div class="totals-row">
          <span>Discount:</span>
          <span>-${this.formatCurrency(discount, currency)}</span>
        </div>
      ` : ''}
      ${taxRate > 0 ? `
        <div class="totals-row">
          <span>Tax (${taxRate}%):</span>
          <span>${this.formatCurrency(taxAmount, currency)}</span>
        </div>
      ` : ''}
      <div class="totals-row total">
        <span>Total:</span>
        <span>${this.formatCurrency(total, currency)}</span>
      </div>
    </div>

    <!-- Notes -->
    ${notes ? `
      <div class="notes">
        <h4>Notes:</h4>
        <p>${notes}</p>
      </div>
    ` : ''}

    ${termsAndConditions ? `
      <div class="notes">
        <h4>Terms & Conditions:</h4>
        <p>${termsAndConditions}</p>
      </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>For any questions, please contact us at your@company.com</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Format date
   */
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      PKR: 'Rs.'
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  /**
   * Format address
   */
  formatAddress(address) {
    if (!address) return '';
    
    const parts = [];
    if (address.street) parts.push(`<p>${address.street}</p>`);
    if (address.city || address.state || address.zipCode) {
      const line = [address.city, address.state, address.zipCode].filter(Boolean).join(', ');
      parts.push(`<p>${line}</p>`);
    }
    if (address.country) parts.push(`<p>${address.country}</p>`);
    
    return parts.join('');
  }
}

module.exports = new InvoiceTemplateGenerator();