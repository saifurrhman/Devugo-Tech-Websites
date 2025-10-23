const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');

//
// ✅ FIXED: Middleware ko sahi se import kiya hai
//
const { requireAuth, requireRole } = require('../middlewares/auth');

router.post('/events', ctrl.capture);

//
// ✅ FIXED: Sahi middleware functions istemal kiye hain
//
router.get('/metrics', requireAuth, requireRole('admin'), ctrl.metrics);

router.get('/summary', ctrl.summary);
module.exports = router;