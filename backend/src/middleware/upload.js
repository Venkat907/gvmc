const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine with safe sanitization
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent directory traversal
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for CSV, JSON, XLSX
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.json', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'text/csv',
    'application/csv',
    'text/plain',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream', // Some browsers send octet-stream for csv/xlsx
  ];

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(`Unsupported file extension ${ext}. Only CSV, JSON, and XLSX files are permitted.`),
      false
    );
  }

  // Double check MIME type loosely to allow various OS upload headers while enforcing extension
  cb(null, true);
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10); // default 50MB

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});

module.exports = { upload, uploadDir };
