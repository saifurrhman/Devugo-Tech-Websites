const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// UPLOAD SINGLE IMAGE (BASE64)
// ============================================
router.post('/image', async (req, res) => {
  try {
    console.log('✅ Base64 upload request received');
    
    const { dataUrl, filename } = req.body;
    
    if (!dataUrl) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided'
      });
    }

    // Validate base64 format
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    // Generate unique filename for Cloudinary
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const publicId = filename 
      ? `${filename.replace(/\.[^/.]+$/, '')}-${uniqueSuffix}`
      : `image-${uniqueSuffix}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
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
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes
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
// UPLOAD MULTIPLE IMAGES (BASE64)
// ============================================
router.post('/images', async (req, res) => {
  try {
    console.log('✅ Multiple base64 upload request received');
    
    const { images } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const uploadPromises = images.map(async (img, index) => {
      const { dataUrl, filename } = img;
      
      const uniqueSuffix = Date.now() + '-' + index + '-' + Math.round(Math.random() * 1E9);
      const publicId = filename 
        ? `${filename.replace(/\.[^/.]+$/, '')}-${uniqueSuffix}`
        : `image-${uniqueSuffix}`;

      const result = await cloudinary.uploader.upload(dataUrl, {
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
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
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
// DELETE IMAGE FROM CLOUDINARY
// ============================================
router.delete('/image/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const decodedPublicId = decodeURIComponent(publicId);
    
    console.log('🗑️ Deleting image:', decodedPublicId);
    
    const result = await cloudinary.uploader.destroy(decodedPublicId);
    
    if (result.result === 'ok') {
      console.log('✅ Image deleted successfully');
      res.json({
        success: true,
        message: 'Image deleted successfully',
        result: result
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted',
        result: result
      });
    }
    
  } catch (error) {
    console.error('❌ Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// ============================================
// GET IMAGE INFO
// ============================================
router.get('/image/:publicId', async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    
    const result = await cloudinary.api.resource(publicId);
    
    res.json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        createdAt: result.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Get Image Error:', error);
    res.status(404).json({
      success: false,
      message: 'Image not found',
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
    message: 'Upload service is running',
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
  });
});

module.exports = router;