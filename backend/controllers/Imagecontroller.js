const fs = require('fs');
const path = require('path');

// ============================================
// SINGLE IMAGE UPLOAD HANDLER
// ============================================
const uploadSingleImage = async (req, res) => {
  try {
    console.log('✅ Upload request received');
    console.log('File:', req.file);

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Koi image select nahi ki gayi!'
      });
    }

    // ✅ CRITICAL FIX: Generate FULL URL with protocol and host
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    console.log('✅ Image uploaded successfully:', imageUrl);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Image successfully upload ho gayi!',
      data: {
        filename: req.file.filename,
        url: imageUrl,  // ✅ This should return: http://localhost:5000/uploads/image-xxx.jpg
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
      message: 'Image upload mein error aayi',
      error: error.message
    });
  }
};

// ============================================
// MULTIPLE IMAGES UPLOAD HANDLER
// ============================================
const uploadMultipleImages = async (req, res) => {
  try {
    console.log('✅ Multiple upload request received');
    console.log('Files count:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Koi images select nahi ki gayi!'
      });
    }

    // ✅ FIXED: Generate FULL URLs
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
      message: `${req.files.length} images successfully upload ho gayi!`,
      count: req.files.length,
      data: imagesData
    });

  } catch (error) {
    console.error('❌ Multiple Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Images upload mein error aayi',
      error: error.message
    });
  }
};

// ============================================
// IMAGE DELETE HANDLER
// ============================================
const deleteImage = async (req, res) => {
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
        message: 'Image successfully delete ho gayi!',
        filename: filename
      });
    } else {
      console.log('❌ File not found:', filePath);
      res.status(404).json({
        success: false,
        message: 'Image nahi mili!'
      });
    }
  } catch (error) {
    console.error('❌ Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Image delete karne mein error aayi',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
};