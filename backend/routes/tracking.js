const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.get('/pixel/:trackingId', trackingController.trackOpen);
router.get('/click/:trackingId', trackingController.trackClick);
router.post('/open/:trackingId', trackingController.trackOpen);
router.post('/click/:trackingId', trackingController.trackClick);

module.exports = router;