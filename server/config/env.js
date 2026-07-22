require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8341,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackverse',
  jwtSecret: process.env.JWT_SECRET || 'hackverse_super_secret_dev_key_987654321',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
};
