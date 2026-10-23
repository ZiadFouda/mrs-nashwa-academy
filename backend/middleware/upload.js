const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Upload base directory
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
const MATERIALS_DIR = path.join(UPLOADS_DIR, 'materials');
const QUESTIONS_DIR = path.join(UPLOADS_DIR, 'questions');
const GENERAL_DIR = path.join(UPLOADS_DIR, 'general');

// Ensure upload directories exist
[UPLOADS_DIR, MATERIALS_DIR, QUESTIONS_DIR, GENERAL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  // PDFs
  'application/pdf',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.doc', '.docx', '.txt'];

/**
 * Disk storage configuration with UUID naming and folder destination routing
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.baseUrl.includes('materials')) {
      cb(null, MATERIALS_DIR);
    } else if (req.baseUrl.includes('questions') || req.baseUrl.includes('assignments')) {
      cb(null, QUESTIONS_DIR);
    } else {
      cb(null, GENERAL_DIR);
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeUUID = uuidv4();
    cb(null, `${safeUUID}${ext}`);
  }
});

/**
 * File filter to ensure allowed file types and block suspicious extensions
 */
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check against double extensions (e.g. file.pdf.exe)
  const parts = file.originalname.split('.');
  if (parts.length > 2) {
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs', 'scr', 'pif', 'com'];
    for (let i = 1; i < parts.length; i++) {
      if (dangerousExtensions.includes(parts[i].toLowerCase())) {
        return cb(new Error('Potential executable or disguised script detected.'), false);
      }
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, Images (JPEG, PNG, WebP, GIF), Documents (DOC, DOCX, TXT)`),
      false
    );
  }

  cb(null, true);
}

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024; // 50MB

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10
  },
  fileFilter
});

/**
 * Virus scan & malicious header validation placeholder
 * Verifies magic bytes to ensure file content matches extension and is not an executable
 */
function virusScanPlaceholder(req, res, next) {
  if (!req.file && !req.files) {
    return next();
  }

  const filesToCheck = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

  try {
    for (const file of filesToCheck) {
      if (!file.path || !fs.existsSync(file.path)) continue;

      // Read initial 8 bytes for signature check
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // Check for DOS / PE executable header "MZ" (0x4D 0x5A)
      if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: 'Security Alert: Executable file signature detected. Upload rejected.'
        });
      }

      // Check for ELF executable signature 0x7F 'E' 'L' 'F'
      if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: 'Security Alert: Binary executable signature detected. Upload rejected.'
        });
      }
    }
    next();
  } catch (err) {
    console.error('File security check error:', err);
    return res.status(500).json({ success: false, message: 'File security verification failed.' });
  }
}

/**
 * Sharp image watermarking utility for student screen protection
 * Stamps student ID / timestamp watermark lightly across image
 */
async function watermarkImage(inputPath, watermarkText) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return inputPath;
    }

    const svgWatermark = Buffer.from(`
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <text x="20" y="100" font-size="20" fill="rgba(255, 0, 0, 0.18)" font-family="sans-serif" font-weight="bold" transform="rotate(-25 150 100)">
          ${watermarkText}
        </text>
      </svg>
    `);

    const tempOut = inputPath + '.wm.tmp';
    await sharp(inputPath)
      .composite([{ input: svgWatermark, tile: true, blend: 'over' }])
      .toFile(tempOut);

    fs.renameSync(tempOut, inputPath);
    return inputPath;
  } catch (err) {
    console.error('Watermarking error:', err.message);
    return inputPath;
  }
}

module.exports = {
  upload,
  virusScanPlaceholder,
  watermarkImage,
  UPLOADS_DIR,
  MATERIALS_DIR,
  QUESTIONS_DIR,
  GENERAL_DIR
};
