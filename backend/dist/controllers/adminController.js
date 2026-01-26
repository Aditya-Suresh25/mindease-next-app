"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminSession = exports.getAdminLogs = exports.getActivityBlueprints = exports.getUsers = exports.getReportStats = exports.getChatStats = exports.getActivityStats = exports.getMoodTrends = exports.getDashboardStats = exports.adminLogin = void 0;
const User_1 = require("../models/User");
const Mood_1 = require("../models/Mood");
const Activity_1 = require("../models/Activity");
const ChatSession_1 = require("../models/ChatSession");
const ReflectionReport_1 = require("../models/ReflectionReport");
const AdminLog_1 = require("../models/AdminLog");
const adminAuth_1 = require("../middleware/adminAuth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const date_fns_1 = require("date-fns");
/**
 * Admin Login - Separate from regular user login
 * POST /api/admin/login
 */
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        // Find user and check if admin
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        if (user.role !== "admin") {
            // Log failed admin login attempt
            await (0, adminAuth_1.logAdminAction)({
                adminId: user._id,
                adminEmail: email,
                action: "ADMIN_LOGIN_DENIED",
                resource: "auth",
                details: { reason: "Not an admin account" },
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        // Generate JWT token with admin flag
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: "admin" }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "8h" } // Shorter expiry for admin tokens
        );
        // Log successful admin login
        await (0, adminAuth_1.logAdminAction)({
            adminId: user._id,
            adminEmail: user.email,
            action: "ADMIN_LOGIN_SUCCESS",
            resource: "auth",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
            message: "Admin login successful",
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.adminLogin = adminLogin;
/**
 * Get Dashboard Overview Stats
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalMoodEntries, totalActivities, totalChatSessions, totalReports, recentUsers,] = await Promise.all([
            User_1.User.countDocuments({ role: "user" }),
            Mood_1.Mood.countDocuments({ isDeleted: { $ne: true } }),
            Activity_1.Activity.countDocuments({ isDeleted: { $ne: true } }),
            ChatSession_1.ChatSession.countDocuments(),
            ReflectionReport_1.ReflectionReport.countDocuments(),
            User_1.User.countDocuments({
                role: "user",
                createdAt: { $gte: (0, date_fns_1.subDays)(new Date(), 7) },
            }),
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_DASHBOARD_STATS",
            resource: "dashboard",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: {
                totalUsers,
                totalMoodEntries,
                totalActivities,
                totalChatSessions,
                totalReports,
                recentUsers,
                lastUpdated: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("Get dashboard stats error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};
exports.getDashboardStats = getDashboardStats;
/**
 * Get Mood Trends (Aggregated - No PII)
 * GET /api/admin/analytics/mood-trends
 */
const getMoodTrends = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        // Aggregate mood data by day - NO user identification
        const moodTrends = await Mood_1.Mood.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate },
                    isDeleted: { $ne: true },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                    },
                    averageScore: { $avg: "$score" },
                    averageIntensity: { $avg: "$intensity" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Get score distribution
        const scoreDistribution = await Mood_1.Mood.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate },
                    isDeleted: { $ne: true },
                },
            },
            {
                $bucket: {
                    groupBy: "$score",
                    boundaries: [0, 20, 40, 60, 80, 101],
                    default: "Other",
                    output: { count: { $sum: 1 } },
                },
            },
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_MOOD_TRENDS",
            resource: "analytics",
            details: { days },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: {
                trends: moodTrends,
                distribution: scoreDistribution,
                period: { days, startDate: startDate.toISOString() },
            },
        });
    }
    catch (error) {
        console.error("Get mood trends error:", error);
        res.status(500).json({ message: "Failed to fetch mood trends" });
    }
};
exports.getMoodTrends = getMoodTrends;
/**
 * Get Activity Usage Stats (Aggregated)
 * GET /api/admin/analytics/activity-stats
 */
const getActivityStats = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        // Activity type distribution
        const activityByType = await Activity_1.Activity.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate },
                    isDeleted: { $ne: true },
                },
            },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    totalDuration: { $sum: { $ifNull: ["$duration", 0] } },
                },
            },
            { $sort: { count: -1 } },
        ]);
        // Daily activity counts
        const dailyActivity = await Activity_1.Activity.aggregate([
            {
                $match: {
                    timestamp: { $gte: startDate },
                    isDeleted: { $ne: true },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_ACTIVITY_STATS",
            resource: "analytics",
            details: { days },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: {
                byType: activityByType,
                daily: dailyActivity,
                period: { days, startDate: startDate.toISOString() },
            },
        });
    }
    catch (error) {
        console.error("Get activity stats error:", error);
        res.status(500).json({ message: "Failed to fetch activity stats" });
    }
};
exports.getActivityStats = getActivityStats;
/**
 * Get Chat Session Stats (Aggregated - No message content)
 * GET /api/admin/analytics/chat-stats
 */
const getChatStats = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        // Sessions by status
        const sessionsByStatus = await ChatSession_1.ChatSession.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        // Daily session counts
        const dailySessions = await ChatSession_1.ChatSession.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                    avgMessages: { $avg: { $size: "$messages" } },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Average messages per session
        const avgMessagesPerSession = await ChatSession_1.ChatSession.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: null,
                    avgMessages: { $avg: { $size: "$messages" } },
                    totalSessions: { $sum: 1 },
                },
            },
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_CHAT_STATS",
            resource: "analytics",
            details: { days },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: {
                byStatus: sessionsByStatus,
                daily: dailySessions,
                averageMessagesPerSession: avgMessagesPerSession[0]?.avgMessages || 0,
                period: { days, startDate: startDate.toISOString() },
            },
        });
    }
    catch (error) {
        console.error("Get chat stats error:", error);
        res.status(500).json({ message: "Failed to fetch chat stats" });
    }
};
exports.getChatStats = getChatStats;
/**
 * Get Reports Metadata (No content)
 * GET /api/admin/analytics/report-stats
 */
const getReportStats = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = (0, date_fns_1.subDays)(new Date(), days);
        // Reports by period type
        const reportsByPeriod = await ReflectionReport_1.ReflectionReport.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: "$period",
                    count: { $sum: 1 },
                },
            },
        ]);
        // Daily report generation
        const dailyReports = await ReflectionReport_1.ReflectionReport.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_REPORT_STATS",
            resource: "analytics",
            details: { days },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: {
                byPeriod: reportsByPeriod,
                daily: dailyReports,
                period: { days, startDate: startDate.toISOString() },
            },
        });
    }
    catch (error) {
        console.error("Get report stats error:", error);
        res.status(500).json({ message: "Failed to fetch report stats" });
    }
};
exports.getReportStats = getReportStats;
/**
 * Get User List (Basic info only - No sensitive data)
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_1.User.find({ role: "user" })
                .select("name email createdAt stats.streak stats.lastActiveDate")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User_1.User.countDocuments({ role: "user" }),
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_USERS_LIST",
            resource: "users",
            details: { page, limit },
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};
exports.getUsers = getUsers;
/**
 * Get Activity Blueprints/Types
 * GET /api/admin/activity-blueprints
 */
const getActivityBlueprints = async (req, res) => {
    try {
        // Get unique activity types with counts
        const blueprints = await Activity_1.Activity.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    sampleNames: { $addToSet: "$name" },
                },
            },
            {
                $project: {
                    type: "$_id",
                    count: 1,
                    sampleNames: { $slice: ["$sampleNames", 5] },
                    _id: 0,
                },
            },
            { $sort: { count: -1 } },
        ]);
        // Log admin action
        await (0, adminAuth_1.logAdminAction)({
            adminId: req.user._id,
            adminEmail: req.user.email,
            action: "VIEW_ACTIVITY_BLUEPRINTS",
            resource: "activities",
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });
        res.json({
            success: true,
            data: blueprints,
        });
    }
    catch (error) {
        console.error("Get activity blueprints error:", error);
        res.status(500).json({ message: "Failed to fetch activity blueprints" });
    }
};
exports.getActivityBlueprints = getActivityBlueprints;
/**
 * Get Admin Action Logs
 * GET /api/admin/logs
 */
const getAdminLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AdminLog_1.AdminLog.find()
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AdminLog_1.AdminLog.countDocuments(),
        ]);
        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    }
    catch (error) {
        console.error("Get admin logs error:", error);
        res.status(500).json({ message: "Failed to fetch admin logs" });
    }
};
exports.getAdminLogs = getAdminLogs;
/**
 * Verify Admin Session
 * GET /api/admin/verify
 */
const verifyAdminSession = async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to verify session" });
    }
};
exports.verifyAdminSession = verifyAdminSession;
