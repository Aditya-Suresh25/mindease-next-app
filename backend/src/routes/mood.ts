import express from "express";
import { auth } from "../middleware/auth";
import { createMood, getMoods } from "../controllers/moodController";

const router = express.Router();

// All routes are protected with authentication
router.use(auth);

// Track a new mood entry
router.post("/", createMood);

// Get recent mood entries
router.get("/", auth, getMoods);



export default router;