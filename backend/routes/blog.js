const router = require('express').Router();
const ctrl = require('../controllers/blogController');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/', ctrl.list);
router.get('/automation-stats', requireAuth, requireRole('admin'), ctrl.getAutomationStats);
router.get('/:id', ctrl.get);
router.post('/', requireAuth, requireRole('admin','editor','author'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin','editor','author'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin','editor'), ctrl.remove);

module.exports = router;
