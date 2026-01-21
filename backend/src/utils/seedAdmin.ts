/**
 * Admin Seed Script
 * 
 * DEVELOPMENT ONLY - Creates a default admin account if none exists.
 * 
 * Default Admin Credentials:
 * - Name: Sung Jinwoo
 * - Email: sololevelling@gmail.com
 * - Password: jinwoo12345
 * 
 * WARNING: These credentials should be changed immediately in production!
 * This seeder is intended for development/testing purposes only.
 */

import bcrypt from "bcrypt";
import { User } from "../models/User";
import { logger } from "./logger";

// Default admin configuration - DEVELOPMENT ONLY
const DEFAULT_ADMIN = {
  name: "Sung Jinwoo",
  email: "sololevelling@gmail.com",
  password: "jinwoo12345", // Will be hashed before storage
  role: "admin" as const,
};

export const seedDefaultAdmin = async (): Promise<void> => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      logger.info("Admin user already exists. Skipping seed.");
      return;
    }

    // Check if the default admin email is already in use (as a regular user)
    const existingUser = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingUser) {
      // Upgrade existing user to admin
      existingUser.role = "admin";
      await existingUser.save();
      logger.info(`Upgraded existing user ${DEFAULT_ADMIN.email} to admin role.`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    // Create the default admin
    const admin = new User({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
      notifications: {
        email: true,
        push: true,
        dailyCheckIn: false, // Admins don't need daily check-ins
      },
      privacySettings: {
        publicProfile: false,
        shareDataForResearch: false,
      },
      preferences: {
        theme: "system",
        language: "en",
      },
      stats: {
        streak: 0,
        lastActiveDate: null,
        totalActiveDays: 0,
      },
    });

    await admin.save();

    logger.info("=".repeat(60));
    logger.info("DEFAULT ADMIN CREATED - DEVELOPMENT ONLY");
    logger.info("=".repeat(60));
    logger.info(`Email: ${DEFAULT_ADMIN.email}`);
    logger.info(`Password: ${DEFAULT_ADMIN.password}`);
    logger.info("=".repeat(60));
    logger.warn("⚠️  IMPORTANT: Change these credentials in production!");
    logger.info("=".repeat(60));
  } catch (error) {
    logger.error("Failed to seed default admin:", error);
    throw error;
  }
};

/**
 * Disable default admin seeding
 * Call this in production to prevent accidental admin creation
 */
export const shouldSeedAdmin = (): boolean => {
  // Only seed in development or when explicitly enabled
  const nodeEnv = process.env.NODE_ENV || "development";
  const seedEnabled = process.env.SEED_ADMIN === "true";

  if (nodeEnv === "production" && !seedEnabled) {
    logger.info("Admin seeding disabled in production. Set SEED_ADMIN=true to enable.");
    return false;
  }

  return true;
};
