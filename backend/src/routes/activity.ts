import express from "express";
import { auth } from "../middleware/auth";
import {
  logActivity,
  getActivities,
} from "../controllers/activityController";

const router = express.Router();

router.use(auth);

// Get all activities
router.get("/", getActivities);

// Log a new activity
router.post("/", logActivity);

export default router;
