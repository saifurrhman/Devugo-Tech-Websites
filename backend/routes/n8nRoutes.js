const express = require('express');
const router = express.Router();
const controller = require('../controllers/n8nController');
const requireApiKey = require('../middlewares/requireApiKey');

const { requireAuth } = require('../middlewares/auth');

// Metrics (Traffic, etc.)
router.get('/metrics', requireAuth, controller.getMetrics);
router.post('/metrics', requireApiKey('metrics:write'), controller.storeMetrics);

// Blog Automation
router.post('/blog', requireApiKey('blog:write'), controller.createBlogPost);

// Contact Sync
router.post('/contacts', requireApiKey('contacts:write'), controller.syncContacts);

module.exports = router;
