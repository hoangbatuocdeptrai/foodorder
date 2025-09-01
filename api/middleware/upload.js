const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname || '.jpg'));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Check file type
    checkFileType(file, cb);
  }
}).single('image'); // 'image' is the field name in the form

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  
  // Check mime type
  const mimetype = file.mimetype && filetypes.test(file.mimetype.toLowerCase());
  
  // Check extension if originalname exists
  let extname = true;
  if (file.originalname) {
    extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  }

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
}

// Middleware wrapper to handle errors
module.exports = function(req, res, next) {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    
    // Log successful file upload
    if (req.file) {
      console.log('File uploaded successfully:', req.file.filename);
    } else {
      console.log('No file uploaded with this request');
    }
    
    // Everything went fine
    next();
  });
}; 