const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// ============================================
// SINGLE IMAGE UPLOAD
// ============================================
router.post('/upload-single', upload.single('image'), async (req, res) => {
  try {
    console.log('✅ Upload request received');
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image selected!'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('✅ Image uploaded successfully:', imageUrl);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname
      }
    });

  } catch (error) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message
    });
  }
});

// ============================================
// MULTIPLE IMAGES UPLOAD
// ============================================
router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    console.log('✅ Multiple upload request received');
    console.log('Files count:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images selected!'
      });
    }

    const imagesData = req.files.map(file => ({
      filename: file.filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname
    }));

    console.log(`✅ ${req.files.length} images uploaded successfully`);

    res.status(200).json({
      success: true,
      message: `${req.files.length} images uploaded successfully!`,
      count: req.files.length,
      data: imagesData
    });

  } catch (error) {
    console.error('❌ Multiple Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Images upload failed',
      error: error.message
    });
  }
});

// ============================================
// DELETE IMAGE
// ============================================
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    console.log('Delete request for:', filename);

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename!'
      });
    }

    const filePath = path.join(__dirname, '../public/uploads', filename);
    console.log('Checking file at:', filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Image deleted:', filename);
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully!',
        filename: filename
      });
    } else {
      console.log('❌ File not found:', filePath);
      res.status(404).json({
        success: false,
        message: 'Image not found!'
      });
    }
  } catch (error) {
    console.error('❌ Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Image delete failed',
      error: error.message
    });
  }
});

module.exports = router;