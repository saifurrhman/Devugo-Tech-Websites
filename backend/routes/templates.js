const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, templateController.getAllTemplates);
router.get('/:id', auth, templateController.getTemplateById);
router.post('/', auth, templateController.createTemplate);
router.put('/:id', auth, templateController.updateTemplate);
router.delete('/:id', auth, templateController.deleteTemplate);

module.exports = router;