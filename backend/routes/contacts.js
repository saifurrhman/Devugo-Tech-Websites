const router = require('express').Router();
const ctrl = require('../controllers/contactController');
const { requireAuth } = require('../middlewares/auth');

router.post('/', ctrl.submit);
router.get('/', requireAuth, ctrl.list);

module.exports = router;
