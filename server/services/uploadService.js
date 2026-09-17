import fs from 'node:fs';
import path from 'node:path';
import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';
import { CircuitBreaker } from '../utils/CircuitBreaker.js';

export class UploadService {
  constructor() {
    // Circuit breaker guarding Cloudinary external uploads
    this.cloudinaryBreaker = new CircuitBreaker({
      name: 'Cloudinary',
      failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURES || '3', 10),
      recoveryTimeout: parseInt(process.env.CIRCUIT_BREAKER_RECOVERY_MS || '30000', 10),
      requestTimeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '8000', 10),
    });
  }

  /**
   * Upload a local file to Cloudinary with Circuit Breaker protection.
   * If Cloudinary is down, timing out, or unconfigured, fallback gracefully to local storage path.
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
    const hasCloudinaryCreds = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!hasCloudinaryCreds) {
      logger.info('[UploadService] Cloudinary credentials not configured; using local storage.');
      return localUrl;
    }

    // Wrap Cloudinary network call inside the Circuit Breaker
    return await this.cloudinaryBreaker.fire(
      async () => {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: `hackverse/${folder}`,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
        });

        // Remove temporary local file after successful Cloudinary upload
        if (fs.existsSync(file.path)) {
          fs.unlink(file.path, (err) => {
            if (err) logger.error(`[UploadService] Failed to clean up temp file ${file.path}: ${err.message}`);
          });
        }

        logger.info(`[UploadService] Cloudinary upload successful: ${uploadResult.secure_url}`);
        return uploadResult.secure_url;
      },
      // Fallback function triggered when circuit is OPEN or upload fails
      async (err) => {
        logger.warn(
          `[UploadService] CircuitBreaker fallback active. Serving local upload path '${localUrl}'. Reason: ${err.message}`
        );
        return localUrl;
      }
    );
  }

  /**
   * Retrieve circuit breaker health and metrics
   */
  getCircuitStatus() {
    return this.cloudinaryBreaker.getDiagnostics();
  }
}

export const uploadService = new UploadService();
export default uploadService;
