// routes/imageRoutes.js
// Path: D:\Devugo-Tech-Websites\backend\routes\imageRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
} = require('../controllers/imagecontroller');

// Note: Aapke folder name 'controllers' (plural) hai aur file 'imagecontroller.js' (lowercase) hai
// Isliye path accordingly set kiya hai

// ============================================================================
// IMAGE UPLOAD ROUTES
// ============================================================================

/**
 * @route   POST /api/images/upload-single
 * @desc    Upload single image
 * @access  Public (add auth middleware if needed)
 */
router.post('/upload-single', upload.single('image'), uploadSingleImage);

/**
 * @route   POST /api/images/upload-multiple
 * @desc    Upload multiple images (max 10)
 * @access  Public (add auth middleware if needed)
 */
router.post('/upload-multiple', upload.array('images', 10), uploadMultipleImages);

/**
 * @route   DELETE /api/images/delete/:filename
 * @desc    Delete an uploaded image
 * @access  Public (add auth middleware if needed)
 */
router.delete('/delete/:filename', deleteImage);

/**
 * @route   GET /api/images/test
 * @desc    Test if image routes are working
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Image upload routes are working! ✅',
    endpoints: {
      uploadSingle: 'POST /api/images/upload-single',
      uploadMultiple: 'POST /api/images/upload-multiple',
      deleteImage: 'DELETE /api/images/delete/:filename'
    }
  });
});

module.exports = router;