const router = require('express').Router();
const ctrl = require('../controllers/contactController');
const requireAdmin = require('../middlewares/auth');

router.post('/', ctrl.submit);
router.get('/', requireAdmin, ctrl.list);

module.exports = router;
