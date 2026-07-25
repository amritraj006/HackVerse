const User = require('../models/User');
const logger = require('./logger');

/**
 * Seed initial default Super Admin account if no admin exists in database.
 */
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@hackverse.io';
      const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

      await User.create({
        name: 'System Admin',
        email: defaultAdminEmail.toLowerCase(),
        password: defaultAdminPassword,
        role: 'admin',
        bio: 'Primary Platform System Administrator',
      });

      logger.info(`[Admin Seeder] Created default Super Admin account: ${defaultAdminEmail}`);
    }
  } catch (error) {
    logger.error(`[Admin Seeder] Error seeding admin account: ${error.message}`);
  }
};

module.exports = seedAdmin;
