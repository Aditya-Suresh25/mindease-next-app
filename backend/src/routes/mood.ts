import express from "express";
import { auth } from "../middleware/auth";
import { createMood, getMoods, updateMood, deleteMood } from "../controllers/moodController";

const router = express.Router();

// All routes are protected with authentication
router.use(auth);

// Track a new mood entry
router.post("/", createMood);

// Get recent mood entries
router.get("/", auth, getMoods);

// Update a mood entry
router.put("/:id", updateMood);

// Delete a mood entry
router.delete("/:id", deleteMood);



export default router;