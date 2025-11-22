const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const EmailRecipient = require('../models/EmailRecipient');
const pdfService = require('../services/pdfService');

class InvoiceController {
  
  /**
   * Get all invoices with filters and pagination
   */
  async getAllInvoices(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        client, 
        project,
        startDate,
        endDate,
        search 
      } = req.query;

      const query = {};

      // Filters
      if (status) query.status = status;
      if (client) query.client = client;
      if (project) query.project = project;
      
      // Date range
      if (startDate || endDate) {
        query.issueDate = {};
        if (startDate) query.issueDate.$gte = new Date(startDate);
        if (endDate) query.issueDate.$lte = new Date(endDate);
      }

      // Search
      if (search) {
        query.$or = [
          { invoiceNumber: new RegExp(search, 'i') },
          { 'clientDetails.name': new RegExp(search, 'i') },
          { 'clientDetails.company': new RegExp(search, 'i') }
        ];
      }

      const skip = (page - 1) * limit;

      const [invoices, total] = await Promise.all([
        Invoice.find(query)
          .populate('client', 'email fullName company')
          .populate('project', 'title status')
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Invoice.countDocuments(query)
      ]);

      // Calculate summary stats
      const stats = await Invoice.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            totalPaid: { $sum: '$amountPaid' },
            totalBalance: { $sum: '$balance' }
          }
        }
      ]);

      res.json({
        success: true,
        data: invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || { totalAmount: 0, totalPaid: 0, totalBalance: 0 }
      });

    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoices',
        error: error.message
      });
    }
  }

  /**
   * Get single invoice by ID
   */
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findById(id)
        .populate('client')
        .populate('project')
        .populate('createdBy', 'name email')
        .populate('payments.receivedBy', 'name email');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: invoice
      });

    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching invoice',
        error: error.message
      });
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(req, res) {
    try {
      const { 
        client, 
        project, 
        items, 
        dueDate,
        taxRate,
        discount,
        discountType,
        notes,
        termsAndConditions
      } = req.body;

      // Validate client exists
      const clientData = await EmailRecipient.findById(client);
      if (!clientData) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Generate invoice number
      const invoiceNumber = await Invoice.generateInvoiceNumber();

      // Calculate item amounts
      const processedItems = items.map(item => ({
        ...item,
        amount: item.quantity * item.unitPrice
      }));

      // Prepare client details
      const clientDetails = {
        name: clientData.fullName || clientData.displayName,
        email: clientData.email,
        phone: clientData.phone,
        company: clientData.company
      };

      // Create invoice
      const invoice = new Invoice({
        invoiceNumber,
        client,
        clientDetails,
        project,
        items: processedItems,
        dueDate,
        taxRate: taxRate || 0,
        discount: discount || 0,
        discountType: discountType || 'fixed',
        notes,
        termsAndConditions,
        createdBy: req.user._id
      });

      await invoice.save();

      // Update project if provided
      if (project) {
        await Project.findByIdAndUpdate(project, {
          $push: { invoices: invoice._id }
        });
      }

      const populatedInvoice = await Invoice.findById(invoice._id)
        .populate('client')
        .populate('project');

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: populatedInvoice
      });

    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating invoice',
        error: error.message
      });
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Don't allow updates to paid invoices
      if (invoice.status === 'paid' && !req.body.allowPaidUpdate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update paid invoice'
        });
      }

      // Update items if provided
      if (updateData.items) {
        updateData.items = updateData.items.map(item => ({
          ...item,
          amount: item.quantity * item.unitPrice
        }));
      }

      updateData.lastUpdatedBy = req.user._id;

      Object.assign(invoice, updateData);
      await invoice.save();

      const updatedInvoice = await Invoice.findById(id)
        .populate('client')
        .populate('project');

      res.json({
        success: true,
        message: 'Invoice updated successfully',
        data: updatedInvoice
      });

    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating invoice',
        error: error.message
      });
    }
  }

  /**
   * Add payment to invoice
   */
  async addPayment(req, res) {
    try {
      const { id } = req.params;
      const { amount, paymentMethod, transactionId, notes } = req.body;

      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than 0'
        });
      }

      if (invoice.balance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount exceeds balance'
        });
      }

      await invoice.addPayment({
        amount,
        paymentMethod,
        transactionId,
        notes,
        receivedBy: req.user._id
      });

      const updatedInvoice = await Invoice.findById(id)
        .populate('client')
        .populate('project');

      res.json({
        success: true,
        message: 'Payment added successfully',
        data: updatedInvoice
      });

    } catch (error) {
      console.error('Add payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding payment',
        error: error.message
      });
    }
  }

  /**
   * Generate PDF for invoice
   */
  async generatePDF(req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findById(id)
        .populate('client')
        .populate('project');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Generate PDF
      const pdfBuffer = await pdfService.generateInvoicePDF(invoice);

      // Save PDF URL (if using cloud storage)
      // invoice.pdfUrl = uploadedUrl;
      invoice.pdfGeneratedAt = new Date();
      await invoice.save();

      // Send PDF as response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Generate PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating PDF',
        error: error.message
      });
    }
  }

  /**
   * Send invoice via email
   */
  async sendInvoice(req, res) {
    try {
      const { id } = req.params;
      const { recipients, message } = req.body;

      const invoice = await Invoice.findById(id)
        .populate('client')
        .populate('project');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Generate PDF if not exists
      let pdfBuffer;
      if (!invoice.pdfUrl) {
        pdfBuffer = await pdfService.generateInvoicePDF(invoice);
      }

      // Send email (implement your email service)
      // await emailService.sendInvoiceEmail({
      //   to: recipients || [invoice.clientDetails.email],
      //   invoice,
      //   pdfBuffer,
      //   message
      // });

      invoice.status = 'sent';
      invoice.sentAt = new Date();
      invoice.sentTo = recipients || [invoice.clientDetails.email];
      await invoice.save();

      res.json({
        success: true,
        message: 'Invoice sent successfully',
        data: invoice
      });

    } catch (error) {
      console.error('Send invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending invoice',
        error: error.message
      });
    }
  }

  /**
   * Mark invoice as viewed
   */
  async markAsViewed(req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (invoice.status === 'sent') {
        invoice.status = 'viewed';
      }
      
      invoice.viewedAt = new Date();
      await invoice.save();

      res.json({
        success: true,
        message: 'Invoice marked as viewed',
        data: invoice
      });

    } catch (error) {
      console.error('Mark viewed error:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking invoice as viewed',
        error: error.message
      });
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findById(id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // Don't allow deletion of paid invoices
      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete paid invoice'
        });
      }

      await invoice.remove();

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });

    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting invoice',
        error: error.message
      });
    }
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const matchQuery = {};
      if (startDate || endDate) {
        matchQuery.issueDate = {};
        if (startDate) matchQuery.issueDate.$gte = new Date(startDate);
        if (endDate) matchQuery.issueDate.$lte = new Date(endDate);
      }

      const stats = await Invoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$total' },
            totalPaid: { $sum: '$amountPaid' }
          }
        }
      ]);

      const overallStats = await Invoice.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            totalPaid: { $sum: '$amountPaid' },
            totalOutstanding: { $sum: '$balance' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          byStatus: stats,
          overall: overallStats[0] || {}
        }
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }
}

module.exports = new InvoiceController();