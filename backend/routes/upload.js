const router = require('express').Router();
const uploadService = require('../services/uploadService');

// Simple image upload endpoint
// Accepts: { dataUrl: string (base64 data URL), filename?: string }
router.post('/image', async (req, res) => {
  try {
    const { dataUrl, filename = `upload-${Date.now()}.png` } = req.body || {};
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Invalid dataUrl' });
    }
    // Extract base64
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    const result = await uploadService.upload(buffer, filename);
    return res.status(201).json({ url: result.url });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
