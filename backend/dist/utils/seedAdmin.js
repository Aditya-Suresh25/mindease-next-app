"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSeedAdmin = exports.seedDefaultAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const logger_1 = require("./logger");
// Default admin configuration - DEVELOPMENT ONLY
const DEFAULT_ADMIN = {
    name: "Sung Jinwoo",
    email: "sololevelling@gmail.com",
    password: "jinwoo12345", // Will be hashed before storage
    role: "admin",
};
const seedDefaultAdmin = async () => {
    try {
        // Check if any admin already exists
        const existingAdmin = await User_1.User.findOne({ role: "admin" });
        if (existingAdmin) {
            logger_1.logger.info("Admin user already exists. Skipping seed.");
            return;
        }
        // Check if the default admin email is already in use (as a regular user)
        const existingUser = await User_1.User.findOne({ email: DEFAULT_ADMIN.email });
        if (existingUser) {
            // Upgrade existing user to admin
            existingUser.role = "admin";
            await existingUser.save();
            logger_1.logger.info(`Upgraded existing user ${DEFAULT_ADMIN.email} to admin role.`);
            return;
        }
        // Hash the password
        const hashedPassword = await bcrypt_1.default.hash(DEFAULT_ADMIN.password, 12);
        // Create the default admin
        const admin = new User_1.User({
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
        logger_1.logger.info("=".repeat(60));
        logger_1.logger.info("DEFAULT ADMIN CREATED - DEVELOPMENT ONLY");
        logger_1.logger.info("=".repeat(60));
        logger_1.logger.info(`Email: ${DEFAULT_ADMIN.email}`);
        logger_1.logger.info(`Password: ${DEFAULT_ADMIN.password}`);
        logger_1.logger.info("=".repeat(60));
        logger_1.logger.warn("⚠️  IMPORTANT: Change these credentials in production!");
        logger_1.logger.info("=".repeat(60));
    }
    catch (error) {
        logger_1.logger.error("Failed to seed default admin:", error);
        throw error;
    }
};
exports.seedDefaultAdmin = seedDefaultAdmin;
/**
 * Disable default admin seeding
 * Call this in production to prevent accidental admin creation
 */
const shouldSeedAdmin = () => {
    // Only seed in development or when explicitly enabled
    const nodeEnv = process.env.NODE_ENV || "development";
    const seedEnabled = process.env.SEED_ADMIN === "true";
    if (nodeEnv === "production" && !seedEnabled) {
        logger_1.logger.info("Admin seeding disabled in production. Set SEED_ADMIN=true to enable.");
        return false;
    }
    return true;
};
exports.shouldSeedAdmin = shouldSeedAdmin;
