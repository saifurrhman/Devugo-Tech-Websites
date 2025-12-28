const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiKeyController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Protect all routes
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/', controller.listKeys);
router.post('/', controller.generateKey);
router.delete('/:id', controller.revokeKey);

module.exports = router;
