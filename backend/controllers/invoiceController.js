const Invoice = require('../models/Invoice');
const logger = require('../utils/logger');

exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'sent'] }, '$total', 0]
            }
          },
          overdue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overdue'] }, '$total', 0]
            }
          },
          drafts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'draft'] }, '$total', 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || { totalRevenue: 0, pending: 0, overdue: 0, drafts: 0 }
    });
  } catch (error) {
    logger.error('Get invoice stats failed', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, client } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;

    const invoices = await Invoice.find(filter)
      .populate('client', 'email firstName lastName company')
      .populate('project', 'title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Invoice.countDocuments(filter);
    res.json({
      success: true,
      data: invoices,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    logger.error('Get invoices failed', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('project')
      .populate('createdBy', 'name email');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const invoiceNumber = await Invoice.generateInvoiceNumber();
    const invoice = new Invoice({ ...req.body, invoiceNumber, createdBy: req.user._id });
    await invoice.save();
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Create invoice failed', { error: error.message });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    await invoice.addPayment({ ...req.body, receivedBy: req.user._id });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};