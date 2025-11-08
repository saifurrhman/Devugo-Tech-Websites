const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

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

    // Extract base64 data
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const extension = matches[1].split('/')[1]; // e.g., 'jpeg', 'png'
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = filename 
      ? `${path.parse(filename).name}-${uniqueSuffix}.${extension}`
      : `image-${uniqueSuffix}.${extension}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Save file
    const filePath = path.join(uploadDir, finalFilename);
    fs.writeFileSync(filePath, imageBuffer);
    
    const imageUrl = `/uploads/${finalFilename}`;
    
    console.log('✅ Image saved:', imageUrl);
    
    res.status(200).json({
      success: true,
      url: imageUrl,
      filename: finalFilename,
      path: filePath
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

module.exports = router;