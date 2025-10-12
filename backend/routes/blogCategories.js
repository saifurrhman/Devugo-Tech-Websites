const router = require('express').Router();
const ctrl = require('../controllers/blogCategoryController');
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public list (for filters)
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Admin mutations
router.post('/', requireAuth, requireRole('admin','editor'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin','editor'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin','editor'), ctrl.remove);

module.exports = router;
