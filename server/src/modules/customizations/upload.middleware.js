import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../../uploads/artworks');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(6).toString('hex');
    const safeBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `artwork-${Date.now()}-${safeBaseName}-${randomHex}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file type: ${file.mimetype}. Allowed types: PNG, JPEG, WEBP, SVG, and PDF.`
    );
    error.statusCode = 400;
    error.name = 'ValidationError';
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5, // Maximum 5 files per request
  },
  fileFilter,
});

/**
 * Express middleware wrapper to catch Multer errors and format standard error responses.
 */
export const uploadArtworkMiddleware = (fieldName = 'artwork', maxCount = 5) => {
  const multerHandler = maxCount > 1 ? upload.array(fieldName, maxCount) : upload.single(fieldName);

  return (req, res, next) => {
    multerHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'File size exceeds 10MB limit. Please upload a smaller artwork or reference file.',
            error: { code: 'FILE_TOO_LARGE', limit: '10MB' },
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            statusCode: 400,
            message: `Maximum ${maxCount} files allowed per upload.`,
            error: { code: 'TOO_MANY_FILES' },
          });
        }
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: `Upload error: ${err.message}`,
        });
      }
      if (err) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: err.message || 'File upload failed validation',
        });
      }
      next();
    });
  };
};
