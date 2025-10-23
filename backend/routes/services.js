const router = require('express').Router();
const ctrl = require('../controllers/serviceController');

//
// ✅ FIXED: Middleware ko sahi se import kiya hai
//
const { requireAuth, requireRole } = require('../middlewares/auth');

// Public: published-only list
router.get('/public', ctrl.listPublished);
// Public: get by slug (published-only)
router.get('/slug/:slug', ctrl.getBySlug);

// Admin: all services
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

//
// ✅ FIXED: Sahi middleware functions istemal kiye hain
//
router.post('/', requireAuth, requireRole('admin'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update);
// 'ctrl.remove' ab 'serviceController' mein theek ho gaya hai
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove); 

module.exports = router;