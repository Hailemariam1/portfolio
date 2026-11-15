import multer from 'multer';
import { ApiError } from '../utils/http.js';

const MAX_BYTES = 10 * 1024 * 1024;

export const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const resumeMimeTypes = ['application/pdf'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = [...imageMimeTypes, ...resumeMimeTypes];
    if (!allowed.includes(file.mimetype)) {
      cb(
        ApiError.badRequest(
          'Unsupported file type. Upload a JPG, PNG, WebP, GIF image or a PDF resume.'
        )
      );
      return;
    }
    cb(null, true);
  }
});

/** Express error handler for multer-specific failures. */
export function handleUploadErrors(error, _req, _res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.badRequest('That file is larger than the 10 MB limit.'));
    }
    return next(ApiError.badRequest(`Upload failed: ${error.message}`));
  }
  return next(error);
}
