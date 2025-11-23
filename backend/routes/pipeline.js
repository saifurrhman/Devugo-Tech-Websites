const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipelineController');
const { auth } = require('../middlewares/auth');

router.get('/', auth, pipelineController.getAllPipelines);
router.get('/:id', auth, pipelineController.getPipelineById);
router.post('/', auth, pipelineController.createPipeline);
router.put('/:id', auth, pipelineController.updatePipeline);
router.delete('/:id', auth, pipelineController.deletePipeline);

module.exports = router;