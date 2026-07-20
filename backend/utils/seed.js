/**
 * Bootstrap script — run once after first install to create the very first
 * Owner account (needed because normal registration requires an existing
 * owner/admin to approve new members).
 *
 * Usage: npm run seed
 * Reads OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD from environment variables
 * (falls back to sensible defaults if not provided — change the password
 * immediately after first login).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const OrgSettings = require('../models/OrgSettings');
const logger = require('./logger');

const OWNER_NAME = process.env.OWNER_NAME || 'System Owner';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@ishas.org';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'ChangeMe@12345';

const run = async () => {
  await connectDB();

  const existingOwner = await User.findOne({ role: 'owner' });

  if (existingOwner) {
    logger.info(`একজন Owner ইতিমধ্যে বিদ্যমান: ${existingOwner.email}। Seed স্কিপ করা হচ্ছে।`);
  } else {
    const owner = await User.create({
      fullName: OWNER_NAME,
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      role: 'owner',
      membershipStatus: 'active',
      isEmailVerified: true,
      memberId: `ISHAS-${new Date().getFullYear()}-0000`,
      approvedAt: new Date(),
    });

    logger.info('✅ প্রথম Owner একাউন্ট তৈরি হয়েছে:');
    logger.info(`   Email: ${owner.email}`);
    logger.info(`   Password: ${OWNER_PASSWORD}`);
    logger.info('   ⚠️  প্রথম লগইনের পরপরই পাসওয়ার্ড পরিবর্তন করুন।');
  }

  await OrgSettings.getSettings();
  logger.info('✅ ডিফল্ট Organization Settings তৈরি/নিশ্চিত করা হয়েছে।');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seed script ব্যর্থ হয়েছে: ${err.message}`);
  process.exit(1);
});
