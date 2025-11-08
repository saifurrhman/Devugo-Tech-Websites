const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
} = require('../controllers/imagecontroller');

// Upload routes
router.post('/upload-single', upload.single('image'), uploadSingleImage);
router.post('/upload-multiple', upload.array('images', 10), uploadMultipleImages);
router.delete('/delete/:filename', deleteImage);

// Test route
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