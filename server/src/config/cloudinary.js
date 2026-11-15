import { v2 as cloudinary } from 'cloudinary';
import env from './env.js';

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true
  });
}

/** Upload a buffer to Cloudinary and resolve with `{ url, publicId }`. */
export function uploadToCloudinary(buffer, { resourceType = 'image', folder } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || env.cloudinary.folder,
        resource_type: resourceType,
        overwrite: false
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format
        });
      }
    );
    stream.end(buffer);
  });
}

/** Best-effort removal of an asset; never throws. */
export async function destroyCloudinaryAsset(publicId, resourceType = 'image') {
  if (!publicId || !env.cloudinary.enabled) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.warn('[cloudinary] cleanup failed:', error.message);
  }
}

export default cloudinary;
