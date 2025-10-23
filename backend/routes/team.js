const router = require('express').Router();
const ctrl = require('../controllers/teamController');
const { requireAuth } = require('../middlewares/auth');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', requireAuth, ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.remove);

module.exports = router;
