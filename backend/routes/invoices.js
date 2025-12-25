const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { auth } = require('../middlewares/auth');

router.get('/stats', auth, invoiceController.getInvoiceStats);
router.get('/', auth, invoiceController.getAllInvoices);
router.get('/:id', auth, invoiceController.getInvoiceById);
router.post('/', auth, invoiceController.createInvoice);
router.put('/:id', auth, invoiceController.updateInvoice);
router.delete('/:id', auth, invoiceController.deleteInvoice);

module.exports = router;