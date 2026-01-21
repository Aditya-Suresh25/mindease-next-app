"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAdminLogging = exports.logAdminAction = exports.requireRole = exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const AdminLog_1 = require("../models/AdminLog");
/**
 * Middleware to check if user is authenticated and has admin role
 */
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Admin authentication required" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (user.role !== "admin") {
            // Log unauthorized admin access attempt
            await (0, exports.logAdminAction)({
                adminId: user._id,
                adminEmail: user.email,
                action: "UNAUTHORIZED_ACCESS_ATTEMPT",
                resource: req.path,
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });
            return res.status(403).json({
                message: "Access denied. Admin privileges required."
            });
        }
        req.user = user;
        req.isAdmin = true;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid authentication token" });
    }
};
exports.adminAuth = adminAuth;
/**
 * Middleware to check if user has a specific role
 */
const requireRole = (...roles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.header("Authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Authentication required" });
            }
            const token = authHeader.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-secret-key");
            const user = await User_1.User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            if (!roles.includes(user.role)) {
                return res.status(403).json({
                    message: `Access denied. Required role: ${roles.join(" or ")}`
                });
            }
            req.user = user;
            req.isAdmin = user.role === "admin";
            next();
        }
        catch (error) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }
    };
};
exports.requireRole = requireRole;
const logAdminAction = async (params) => {
    try {
        const log = new AdminLog_1.AdminLog({
            adminId: params.adminId,
            adminEmail: params.adminEmail,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId,
            details: params.details,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            timestamp: new Date(),
        });
        await log.save();
    }
    catch (error) {
        console.error("Failed to log admin action:", error);
        // Don't throw - logging failures shouldn't break the main operation
    }
};
exports.logAdminAction = logAdminAction;
/**
 * Middleware wrapper that automatically logs admin actions
 */
const withAdminLogging = (action, resource) => {
    return (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);
        // Override json to log after successful response
        res.json = (body) => {
            // Only log successful operations
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                (0, exports.logAdminAction)({
                    adminId: req.user._id,
                    adminEmail: req.user.email,
                    action,
                    resource,
                    resourceId: req.params.id,
                    details: { method: req.method, path: req.path },
                    ipAddress: req.ip || req.socket.remoteAddress,
                    userAgent: req.headers["user-agent"],
                });
            }
            return originalJson(body);
        };
        next();
    };
};
exports.withAdminLogging = withAdminLogging;
