const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// MULTER FOR MEMORY STORAGE (NOT DISK)
// ============================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// ============================================
// ✅ SINGLE IMAGE UPLOAD - CLOUDINARY
// ============================================
router.post('/upload-single', upload.single('image'), async (req, res) => {
  try {
    console.log('✅ Upload request received');
    console.log('File:', req.file ? 'File present' : 'No file');
    console.log('Body:', Object.keys(req.body));

    let imageData;

    // Handle different input formats
    if (req.file) {
      // ✅ FormData with multer (convert buffer to base64)
      const base64 = req.file.buffer.toString('base64');
      imageData = `data:${req.file.mimetype};base64,${base64}`;
      console.log('Using multer file buffer');
    } else if (req.body.dataUrl) {
      // ✅ Base64 dataUrl from body
      imageData = req.body.dataUrl;
      console.log('Using body dataUrl');
    } else if (req.body.image) {
      // ✅ Base64 from body.image
      imageData = req.body.image;
      console.log('Using body image');
    } else {
      return res.status(400).json({
        success: false,
        message: 'No image data provided!'
      });
    }

    // Validate base64 format
    if (!imageData.startsWith('data:')) {
      imageData = `data:image/jpeg;base64,${imageData}`;
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = req.body.filename || req.file?.originalname || 'image';
    const publicId = `${filename.replace(/\.[^/.]+$/, '')}-${uniqueSuffix}`;

    // ✅ Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageData, {
      folder: 'devugo-tech/uploads',
      public_id: publicId,
      resource_type: 'auto',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
      ]
    });

    console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        filename: publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes
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
// ✅ MULTIPLE IMAGES UPLOAD - CLOUDINARY
// ============================================
router.post('/upload-multiple', upload.array('images', 10), async (req, res) => {
  try {
    console.log('✅ Multiple upload request received');
    console.log('Files count:', req.files?.length || 0);

    let imagesToUpload = [];

    // Handle FormData files
    if (req.files && req.files.length > 0) {
      imagesToUpload = req.files.map(file => ({
        dataUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        filename: file.originalname
      }));
    } 
    // Handle JSON body with base64 images
    else if (req.body.images && Array.isArray(req.body.images)) {
      imagesToUpload = req.body.images.map(img => ({
        dataUrl: typeof img === 'string' ? img : img.dataUrl,
        filename: typeof img === 'object' ? img.filename : 'image'
      }));
    }

    if (imagesToUpload.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided!'
      });
    }

    // ✅ Upload all to Cloudinary
    const uploadPromises = imagesToUpload.map(async (img, index) => {
      const uniqueSuffix = Date.now() + '-' + index + '-' + Math.round(Math.random() * 1E9);
      const publicId = `${img.filename.replace(/\.[^/.]+$/, '')}-${uniqueSuffix}`;

      const result = await cloudinary.uploader.upload(img.dataUrl, {
        folder: 'devugo-tech/uploads',
        public_id: publicId,
        resource_type: 'auto',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        filename: publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    console.log(`✅ ${uploadedImages.length} images uploaded to Cloudinary`);

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully!`,
      count: uploadedImages.length,
      data: uploadedImages
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
// ✅ DELETE IMAGE FROM CLOUDINARY
// ============================================
router.delete('/:publicId', async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    
    console.log('🗑️ Deleting image:', publicId);

    // Try to delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok' || result.result === 'not found') {
      console.log('✅ Image deleted:', publicId);
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully!',
        publicId: publicId
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found!',
        result: result
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

// ============================================
// HEALTH CHECK
// ============================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Image routes service is running',
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
  });
});

module.exports = router;