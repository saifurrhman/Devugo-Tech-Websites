const router = require('express').Router();
const ctrl = require('../controllers/socialLinksController');
const requireAdmin = require('../middlewares/auth');

// Public: enabled-only list
router.get('/public', ctrl.listPublic);

// Admin CRUD
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
