const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  sendCustomEmail,
} = require('../controllers/jobApplicationController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Public — submit application
router.post('/', upload.single('resume'), submitApplication);

// Admin — list all applications
router.get('/', protect, authorize('admin', 'website_manager'), getApplications);

// Admin — update status / delete
router.patch('/:id/status', protect, authorize('admin', 'website_manager'), updateApplicationStatus);
router.post('/:id/email', protect, authorize('admin', 'website_manager'), sendCustomEmail);
router.delete('/:id', protect, authorize('admin', 'website_manager'), deleteApplication);

module.exports = router;
