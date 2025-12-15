const router = require('express').Router();
const ctrl = require('../controllers/contactController');
const { requireAuth } = require('../middlewares/auth');

router.post('/', ctrl.submit); // Public form submission
router.get('/', requireAuth, ctrl.list);
router.post('/add', requireAuth, ctrl.create); // Admin create
router.get('/:id', requireAuth, ctrl.get);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.delete);

module.exports = router;
