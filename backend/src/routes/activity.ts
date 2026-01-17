import express from "express";
import { auth } from "../middleware/auth";
import {
  logActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} from "../controllers/activityController";

const router = express.Router();

router.use(auth);

// Get all activities
router.get("/", getActivities);

// Log a new activity
router.post("/", logActivity);

// Update an activity
router.put("/:id", updateActivity);

// Delete an activity
router.delete("/:id", deleteActivity);

export default router;
