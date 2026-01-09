const router = require('express').Router();
const ctrl = require('../controllers/brandController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public
router.get('/', ctrl.list);

// Admin
router.post('/', requireAuth, requireRole('admin', 'website_manager'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin', 'website_manager'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin', 'website_manager'), ctrl.remove);

module.exports = router;
