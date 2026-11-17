import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import env from '../config/env.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { hasExpectedSignature, imageMimeTypes } from '../middleware/upload.js';

const IMAGE_LIMIT = 5 * 1024 * 1024;
const PDF_LIMIT = 10 * 1024 * 1024;

/**
 * POST /api/admin/uploads
 * Multipart field `file`, plus `kind=image|resume`. Files are streamed to
 * Cloudinary when configured; otherwise they are written to the local
 * `server/uploads` folder (development fallback). MongoDB only ever stores the
 * resulting URL and public id.
 */
export const uploadAsset = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Choose a file to upload first.');

  const kind = req.body.kind === 'resume' ? 'resume' : 'image';
  const { buffer, mimetype, size, originalname } = req.file;
  if (!hasExpectedSignature(buffer, mimetype)) {
    throw ApiError.badRequest('The uploaded file content does not match its file type.');
  }

  if (kind === 'resume') {
    if (mimetype !== 'application/pdf') throw ApiError.badRequest('The resume must be a PDF file.');
    if (size > PDF_LIMIT) throw ApiError.badRequest('The resume must be smaller than 10 MB.');
  } else {
    if (!imageMimeTypes.includes(mimetype)) {
      throw ApiError.badRequest('Images must be JPG, PNG, WebP or GIF.');
    }
    if (size > IMAGE_LIMIT) throw ApiError.badRequest('Images must be smaller than 5 MB.');
  }

  if (env.cloudinary.enabled) {
    const folder = `${env.cloudinary.folder}/${kind === 'resume' ? 'documents' : 'images'}`;
    const asset = await uploadToCloudinary(buffer, {
      resourceType: kind === 'resume' ? 'raw' : 'image',
      folder
    });
    return res.status(201).json({
      asset: {
        ...asset,
        kind,
        fileName: originalname,
        mimetype,
        size
      }
    });
  }

  await fs.mkdir(env.uploads.dir, { recursive: true });
  const extensions = {
    'application/pdf': '.pdf',
    'image/gif': '.gif',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
  };
  const ext = extensions[mimetype] || path.extname(originalname).toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  await fs.writeFile(path.join(env.uploads.dir, fileName), buffer);

  return res.status(201).json({
    asset: {
      url: `${env.uploads.publicPath}/${fileName}`,
      publicId: `local:${fileName}`,
      kind,
      fileName: originalname,
      mimetype,
      size
    }
  });
});
