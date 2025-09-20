const router = require('express').Router();
const ctrl = require('../controllers/authController');

router.post('/login', ctrl.login);
router.get('/me', ctrl.getMe);

module.exports = router;
