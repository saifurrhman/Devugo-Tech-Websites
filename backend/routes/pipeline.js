const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipelineController');
const { auth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

/**
 * @route   GET /api/pipeline
 * @desc    Get all pipelines
 * @access  Private
 */
router.get('/', 
  auth, 
  pipelineController.getAllPipelines
);

/**
 * @route   GET /api/pipeline/:id
 * @desc    Get single pipeline with stats
 * @access  Private
 */
router.get('/:id', 
  auth, 
  pipelineController.getPipelineById
);

/**
 * @route   GET /api/pipeline/:id/stats
 * @desc    Get pipeline statistics
 * @access  Private
 */
router.get('/:id/stats', 
  auth, 
  pipelineController.getPipelineStats
);

/**
 * @route   POST /api/pipeline
 * @desc    Create new pipeline
 * @access  Private (Admin/Manager)
 */
router.post('/', 
  auth, 
  checkRole(['admin', 'manager']),
  pipelineController.createPipeline
);

/**
 * @route   PUT /api/pipeline/:id
 * @desc    Update pipeline
 * @access  Private (Admin/Manager)
 */
router.put('/:id', 
  auth, 
  checkRole(['admin', 'manager']),
  pipelineController.updatePipeline
);

/**
 * @route   POST /api/pipeline/:id/stages
 * @desc    Add stage to pipeline
 * @access  Private (Admin/Manager)
 */
router.post('/:id/stages', 
  auth, 
  checkRole(['admin', 'manager']),
  pipelineController.addStage
);

/**
 * @route   PUT /api/pipeline/:id/stages/:stageId
 * @desc    Update stage
 * @access  Private (Admin/Manager)
 */
router.put('/:id/stages/:stageId', 
  auth, 
  checkRole(['admin', 'manager']),
  pipelineController.updateStage
);

/**
 * @route   DELETE /api/pipeline/:id/stages/:stageId
 * @desc    Delete stage
 * @access  Private (Admin/Manager)
 */
router.delete('/:id/stages/:stageId', 
  auth, 
  checkRole(['admin', 'manager']),
  pipelineController.deleteStage
);

/**
 * @route   PUT /api/pipeline/:id/stages/reorder
 * @desc    Reorder stages
 * @access  Private (Admin/Manager)
 */
router.put('/:id/stages/reorder', 
  auth, 
  checkRole(['admin', 'manager']),
  pipelineController.reorderStages
);

/**
 * @route   GET /api/pipeline/:id/stages/:stageId/leads
 * @desc    Get leads in specific stage
 * @access  Private
 */
router.get('/:id/stages/:stageId/leads', 
  auth, 
  pipelineController.getLeadsByStage
);

/**
 * @route   POST /api/pipeline/:id/stages/:stageId/move-lead
 * @desc    Move lead to different stage
 * @access  Private
 */
router.post('/:id/stages/:stageId/move-lead', 
  auth, 
  pipelineController.moveLeadToStage
);

/**
 * @route   DELETE /api/pipeline/:id
 * @desc    Delete pipeline
 * @access  Private (Admin)
 */
router.delete('/:id', 
  auth, 
  checkRole(['admin']),
  pipelineController.deletePipeline
);

module.exports = router;