"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const adminAuth_1 = require("../middleware/adminAuth");
const router = (0, express_1.Router)();
// Public admin routes (no auth required)
router.post("/login", adminController_1.adminLogin);
// Protected admin routes (require admin authentication)
router.get("/verify", adminAuth_1.adminAuth, adminController_1.verifyAdminSession);
router.get("/dashboard/stats", adminAuth_1.adminAuth, adminController_1.getDashboardStats);
// Analytics routes
router.get("/analytics/mood-trends", adminAuth_1.adminAuth, adminController_1.getMoodTrends);
router.get("/analytics/activity-stats", adminAuth_1.adminAuth, adminController_1.getActivityStats);
router.get("/analytics/chat-stats", adminAuth_1.adminAuth, adminController_1.getChatStats);
router.get("/analytics/report-stats", adminAuth_1.adminAuth, adminController_1.getReportStats);
// User management
router.get("/users", adminAuth_1.adminAuth, adminController_1.getUsers);
// Activity blueprints management
router.get("/activity-blueprints", adminAuth_1.adminAuth, adminController_1.getActivityBlueprints);
// Admin logs
router.get("/logs", adminAuth_1.adminAuth, adminController_1.getAdminLogs);
exports.default = router;
