const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class UploadService {
  /**
   * Upload a local file to Cloudinary and clean up temporary local file.
   * If Cloudinary fails or is unconfigured, fallback gracefully to local storage path.
   *
   * @param {Object} file - Multer file object
   * @param {String} folder - Cloudinary folder name (e.g. 'avatars', 'hackathons')
   * @returns {Promise<String>} Image URL (Cloudinary secure_url or local upload path)
   */
  async uploadImage(file, folder = 'hackverse') {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const localUrl = `/uploads/${file.filename}`;

    // Check if Cloudinary credentials are configured
    const hasCloudinaryCreds =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinaryCreds) {
      logger.info('Cloudinary credentials missing, using local storage.');
      return localUrl;
    }

    try {
      // Upload file path to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: `hackverse/${folder}`,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      });

      // Remove temporary local file after successful Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlink(file.path, (err) => {
          if (err) logger.error(`Failed to remove local file ${file.path}: ${err.message}`);
        });
      }

      logger.info(`Successfully uploaded file to Cloudinary: ${uploadResult.secure_url}`);
      return uploadResult.secure_url;
    } catch (error) {
      logger.error(`Cloudinary upload failed, falling back to local file. Error: ${error.message}`);
      // Return local file path fallback if Cloudinary fails
      return localUrl;
    }
  }
}

module.exports = new UploadService();
