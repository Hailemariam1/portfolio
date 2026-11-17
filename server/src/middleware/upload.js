import multer from 'multer';
import { ApiError } from '../utils/http.js';

const MAX_BYTES = 10 * 1024 * 1024;

export const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const resumeMimeTypes = ['application/pdf'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1, fields: 2, parts: 3, fieldSize: 64 * 1024 },
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

export function hasExpectedSignature(buffer, mimetype) {
  if (!buffer || buffer.length < 4) return false;
  if (mimetype === 'application/pdf') return buffer.subarray(0, 5).toString() === '%PDF-';
  if (mimetype === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString());
  if (mimetype === 'image/webp') {
    return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  }
  return false;
}

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
