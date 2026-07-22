const express = require('express');
const router = express.Router();
const {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer
} = require('../controllers/careerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (or conditionally checked in controller)
router.route('/')
  .get(getCareers)
  .post(protect, authorize('admin', 'website_manager'), createCareer);

router.route('/:id')
  .get(getCareerById)
  .put(protect, authorize('admin', 'website_manager'), updateCareer)
  .delete(protect, authorize('admin', 'website_manager'), deleteCareer);

module.exports = router;
