const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload directory setup
const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPG, PNG, GIF, WEBP)'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Service methods
const uploadService = {
  // Single file upload middleware
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple files upload middleware
  multiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),
  
  // Get file URL
  getFileUrl: (filename, req) => {
    if (!filename) return null;
    // Remove any existing path prefixes
    const cleanFilename = path.basename(filename);
    const protocol = req.protocol || 'http';
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${cleanFilename}`;
  },
  
  // Delete file
  deleteFile: async (filename) => {
    try {
      if (!filename) return false;
      const cleanFilename = path.basename(filename);
      const filePath = path.join(uploadDir, cleanFilename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  },
  
  // Delete multiple files
  deleteFiles: async (filenames) => {
    const results = await Promise.all(
      filenames.map(filename => uploadService.deleteFile(filename))
    );
    return results;
  }
};

module.exports = uploadService;