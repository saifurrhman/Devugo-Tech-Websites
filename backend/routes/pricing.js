const router = require('express').Router();
const ctrl = require('../controllers/pricingController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public route - anyone can view published pricing
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Protected routes - only admin can create/update/delete
router.post('/', requireAuth, ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
