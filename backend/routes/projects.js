const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', 
  auth, 
  projectController.getAllProjects
);

/**
 * @route   GET /api/projects/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get('/stats', 
  auth, 
  projectController.getProjectStats
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project
 * @access  Private
 */
router.get('/:id', 
  auth, 
  projectController.getProjectById
);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private (Admin/Manager)
 */
router.post('/', 
  auth, 
  checkRole(['admin', 'manager']),
  projectController.createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', 
  auth, 
  projectController.updateProject
);

/**
 * @route   POST /api/projects/:id/notes
 * @desc    Add note to project
 * @access  Private
 */
router.post('/:id/notes', 
  auth, 
  projectController.addNote
);

/**
 * @route   PUT /api/projects/:id/milestones/:milestoneId
 * @desc    Update milestone
 * @access  Private
 */
router.put('/:id/milestones/:milestoneId', 
  auth, 
  projectController.updateMilestone
);

/**
 * @route   POST /api/projects/:id/deliverables
 * @desc    Add deliverable
 * @access  Private
 */
router.post('/:id/deliverables', 
  auth, 
  projectController.addDeliverable
);

/**
 * @route   POST /api/projects/:id/deliverables/:deliverableId/approve
 * @desc    Approve deliverable
 * @access  Private (Admin/Manager)
 */
router.post('/:id/deliverables/:deliverableId/approve', 
  auth, 
  checkRole(['admin', 'manager']),
  projectController.approveDeliverable
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Admin)
 */
router.delete('/:id', 
  auth, 
  checkRole(['admin']),
  projectController.deleteProject
);

module.exports = router;