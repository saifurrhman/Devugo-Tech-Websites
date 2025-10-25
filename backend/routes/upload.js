const router = require('express').Router();
const uploadService = require('../services/uploadService');

// Simple image upload endpoint
// Accepts: { dataUrl: string (base64 data URL), filename?: string }
router.post('/image', async (req, res) => {
  try {
    const { dataUrl, filename = `upload-${Date.now()}.png` } = req.body || {};
    
    // Validate dataUrl
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Invalid dataUrl' });
    }

    // Extract base64
    const base64 = dataUrl.split(',')[1];
    if (!base64) {
      return res.status(400).json({ error: 'Invalid base64 data' });
    }

    const buffer = Buffer.from(base64, 'base64');

    // Upload
    const result = await uploadService.upload(buffer, filename);

    return res.status(201).json({ 
      success: true,
      url: result.url 
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ 
      error: 'Upload failed',
      message: err.message 
    });
  }
});

// Upload multiple images
router.post('/images', async (req, res) => {
  try {
    const { images } = req.body || {};
    
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Invalid images array' });
    }

    const results = [];

    for (const img of images) {
      const { dataUrl, filename = `upload-${Date.now()}-${results.length}.png` } = img;
      
      if (!dataUrl || !dataUrl.startsWith('data:')) continue;

      const base64 = dataUrl.split(',')[1];
      if (!base64) continue;

      const buffer = Buffer.from(base64, 'base64');
      const result = await uploadService.upload(buffer, filename);
      
      results.push({ url: result.url, filename });
    }

    return res.status(201).json({ 
      success: true,
      count: results.length,
      uploads: results 
    });

  } catch (err) {
    console.error('Multiple upload error:', err.message);
    return res.status(500).json({ 
      error: 'Upload failed',
      message: err.message 
    });
  }
});

// Get upload by filename (if your service supports it)
router.get('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Assuming uploadService has a get method
    const result = await uploadService.get(filename);
    
    if (!result) {
      return res.status(404).json({ error: 'Image not found' });
    }

    return res.json({ 
      success: true,
      url: result.url 
    });

  } catch (err) {
    console.error('Get image error:', err.message);
    return res.status(500).json({ 
      error: 'Failed to get image',
      message: err.message 
    });
  }
});

// Delete upload (if your service supports it)
router.delete('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Assuming uploadService has a delete method
    await uploadService.delete(filename);
    
    return res.json({ 
      success: true,
      message: 'Image deleted successfully' 
    });

  } catch (err) {
    console.error('Delete image error:', err.message);
    return res.status(500).json({ 
      error: 'Failed to delete image',
      message: err.message 
    });
  }
});

module.exports = router;