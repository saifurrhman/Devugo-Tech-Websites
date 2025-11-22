const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { auth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with filters
 * @access  Private
 */
router.get('/', 
  auth, 
  invoiceController.getAllInvoices
);

/**
 * @route   GET /api/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private
 */
router.get('/stats', 
  auth, 
  invoiceController.getInvoiceStats
);

/**
 * @route   GET /api/invoices/:id
 * @desc    Get single invoice by ID
 * @access  Private
 */
router.get('/:id', 
  auth, 
  invoiceController.getInvoiceById
);

/**
 * @route   POST /api/invoices
 * @desc    Create new invoice
 * @access  Private (Admin/Manager)
 */
router.post('/', 
  auth, 
  checkRole(['admin', 'manager']),
  invoiceController.createInvoice
);

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice
 * @access  Private (Admin/Manager)
 */
router.put('/:id', 
  auth, 
  checkRole(['admin', 'manager']),
  invoiceController.updateInvoice
);

/**
 * @route   POST /api/invoices/:id/payment
 * @desc    Add payment to invoice
 * @access  Private (Admin/Manager)
 */
router.post('/:id/payment', 
  auth, 
  checkRole(['admin', 'manager']),
  invoiceController.addPayment
);

/**
 * @route   GET /api/invoices/:id/pdf
 * @desc    Generate and download invoice PDF
 * @access  Private
 */
router.get('/:id/pdf', 
  auth, 
  invoiceController.generatePDF
);

/**
 * @route   POST /api/invoices/:id/send
 * @desc    Send invoice via email
 * @access  Private (Admin/Manager)
 */
router.post('/:id/send', 
  auth, 
  checkRole(['admin', 'manager']),
  invoiceController.sendInvoice
);

/**
 * @route   POST /api/invoices/:id/viewed
 * @desc    Mark invoice as viewed (public link)
 * @access  Public
 */
router.post('/:id/viewed', 
  invoiceController.markAsViewed
);

/**
 * @route   DELETE /api/invoices/:id
 * @desc    Delete invoice
 * @access  Private (Admin)
 */
router.delete('/:id', 
  auth, 
  checkRole(['admin']),
  invoiceController.deleteInvoice
);

module.exports = router;