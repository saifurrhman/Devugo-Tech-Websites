const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const requireAdmin = require('../middlewares/auth');

router.post('/events', ctrl.capture);
router.get('/metrics', requireAdmin, ctrl.metrics);

module.exports = router;
