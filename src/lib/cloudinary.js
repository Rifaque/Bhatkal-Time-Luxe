import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a file buffer directly to Cloudinary.
 * Useful for handling file streams in Next.js Route Handlers.
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder on Cloudinary
 * @returns {Promise<object>} Upload result
 */
export function uploadBuffer(buffer, folder = 'bhatkal-time-luxe') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary Upload Stream Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export { cloudinary };
