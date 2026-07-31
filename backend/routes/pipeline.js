const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipelineController');
const { auth } = require('../middlewares/auth');

// Specific routes first to avoid ID collision
router.get('/stages', auth, pipelineController.getStages);
router.get('/deals', auth, pipelineController.getLeads);
router.post('/deals', auth, pipelineController.createDeal);
router.put('/deals/:id', auth, pipelineController.updateDeal);
router.delete('/deals/:id', auth, pipelineController.deleteDeal);

router.get('/', auth, pipelineController.getAllPipelines);
router.get('/:id', auth, pipelineController.getPipelineById);
router.post('/', auth, pipelineController.createPipeline);
router.put('/:id', auth, pipelineController.updatePipeline);
router.delete('/:id', auth, pipelineController.deletePipeline);

module.exports = router;