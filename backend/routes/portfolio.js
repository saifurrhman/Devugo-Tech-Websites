const router = require('express').Router();
const ctrl = require('../controllers/portfolioController');

//
// ✅ FIXED: Middleware ko sahi se import kiya hai
//
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

//
// ✅ FIXED: Sahi middleware functions istemal kiye hain
//
router.post('/', requireAuth, requireRole('admin'), ctrl.create);
router.put('/:id', requireAuth, requireRole('admin'), ctrl.update);
router.delete('/:id', requireAuth, requireRole('admin'), ctrl.remove);

module.exports = router;