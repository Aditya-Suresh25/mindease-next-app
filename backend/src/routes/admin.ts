import { Router } from "express";
import {
  adminLogin,
  getDashboardStats,
  getMoodTrends,
  getActivityStats,
  getChatStats,
  getReportStats,
  getUsers,
  getActivityBlueprints,
  getAdminLogs,
  verifyAdminSession,
} from "../controllers/adminController";
import { adminAuth, withAdminLogging } from "../middleware/adminAuth";

const router = Router();

// Public admin routes (no auth required)
router.post("/login", adminLogin);

// Protected admin routes (require admin authentication)
router.get("/verify", adminAuth, verifyAdminSession);
router.get("/dashboard/stats", adminAuth, getDashboardStats);

// Analytics routes
router.get("/analytics/mood-trends", adminAuth, getMoodTrends);
router.get("/analytics/activity-stats", adminAuth, getActivityStats);
router.get("/analytics/chat-stats", adminAuth, getChatStats);
router.get("/analytics/report-stats", adminAuth, getReportStats);

// User management
router.get("/users", adminAuth, getUsers);

// Activity blueprints management
router.get("/activity-blueprints", adminAuth, getActivityBlueprints);

// Admin logs
router.get("/logs", adminAuth, getAdminLogs);

export default router;
