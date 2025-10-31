// middlewares/upload.js
// Path: D:\Devugo-Tech-Websites\backend\middlewares\upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================================================
// UPLOAD DIRECTORY SETUP
// ============================================================================

// Define upload directory path
const uploadDir = path.join(__dirname, '../public/uploads');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
} else {
  console.log('📁 Upload directory exists:', uploadDir);
}

// ============================================================================
// MULTER STORAGE CONFIGURATION
// ============================================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log('📝 Generating filename:', filename);
    cb(null, filename);
  }
});

// ============================================================================
// FILE FILTER (Only Images Allowed)
// ============================================================================

const fileFilter = (req, file, cb) => {
  console.log('🔍 Checking file type:', file.mimetype);
  
  // Allowed image types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  // Allowed file extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg/;
  
  // Check mimetype
  const mimetypeValid = allowedMimeTypes.includes(file.mimetype);
  
  // Check extension
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  
  if (mimetypeValid && extname) {
    console.log('✅ File type accepted');
    return cb(null, true);
  } else {
    console.log('❌ File type rejected:', file.mimetype);
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp, svg)'));
  }
};

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Max 10 files at once
  },
  fileFilter: fileFilter
});

// ============================================================================
// EXPORT
// ============================================================================

module.exports = upload;