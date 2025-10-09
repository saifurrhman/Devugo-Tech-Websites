const router = require('express').Router();
const ctrl = require('../controllers/serviceController');
const requireAdmin = require('../middlewares/auth');

// Public: published-only list
router.get('/public', ctrl.listPublished);
// Public: get by slug (published-only)
router.get('/slug/:slug', ctrl.getBySlug);

// Admin: all services
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
