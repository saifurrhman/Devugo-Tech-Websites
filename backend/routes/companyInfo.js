const router = require('express').Router();
const ctrl = require('../controllers/companyInfoController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public route
router.get('/public', ctrl.getPublic);

// Admin routes
router.get('/', requireAuth, requireRole('admin'), ctrl.get);
router.put('/', requireAuth, requireRole('admin'), ctrl.update);

module.exports = router;