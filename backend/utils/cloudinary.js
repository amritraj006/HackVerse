const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder (e.g. 'hackverse/profiles')
 * @param {object} opts    - Extra cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadBuffer = (buffer, folder, opts = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        ...opts,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Delete an image from Cloudinary by its publicId.
 * @param {string} publicId
 */
const deleteImage = (publicId) => {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadBuffer, deleteImage };
