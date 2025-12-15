const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const aiController = require('../controllers/aiController');
const { auth } = require('../middlewares/auth');

router.post('/generate-ai', auth, aiController.generateEmailTemplate);

router.get('/', auth, templateController.getAllTemplates);
router.get('/:id', auth, templateController.getTemplateById);
router.post('/', auth, templateController.createTemplate);
router.put('/:id', auth, templateController.updateTemplate);
router.delete('/:id', auth, templateController.deleteTemplate);

module.exports = router;