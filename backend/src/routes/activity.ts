import express from "express";
import { auth } from "../middleware/auth";
import {
  logActivity,
  getActivities,
  updateActivity,
  deleteActivity,
  getSuggestions,
  getAllActivityBlueprints,
} from "../controllers/activityController";

const router = express.Router();

router.use(auth);

// Get all available activity blueprints
router.get("/blueprints", getAllActivityBlueprints);

// Get activity suggestions based on latest mood
router.get("/suggestions", getSuggestions);

// Get all activities
router.get("/", getActivities);

// Log a new activity
router.post("/", logActivity);

// Update an activity
router.put("/:id", updateActivity);

// Delete an activity
router.delete("/:id", deleteActivity);

export default router;
