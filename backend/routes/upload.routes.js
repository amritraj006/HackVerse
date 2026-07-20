const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const memoryUpload = require('../middleware/memoryUpload.middleware');

const router = express.Router();

// Allow authenticated users to upload images
router.post(
  '/',
  protect,
  memoryUpload.single('image'),
  uploadController.uploadImage
);

module.exports = router;
