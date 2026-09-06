const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public routes
router.get('/', ctrl.list);
router.get('/featured', ctrl.getFeatured);
router.get('/:id', ctrl.get);

// Protected Admin routes
router.post('/', requireAuth, requireRole('admin'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove);

module.exports = router;
