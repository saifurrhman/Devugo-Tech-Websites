const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');

// Middleware
const { requireAuth, requireRole } = require('../middlewares/auth');

// Legacy endpoints (keep for compatibility)
router.post('/events', ctrl.capture);
router.get('/metrics', requireAuth, requireRole('admin'), ctrl.metrics);

// Main dashboard summary endpoint
router.get('/summary', ctrl.summary);

// NEW: Summary with custom range (7d, 30d, 90d, etc.)
router.get('/summary-range', ctrl.summaryRange);

// NEW: Real-time active users
router.get('/realtime', requireAuth, requireRole('admin'), ctrl.realtime);

module.exports = router;