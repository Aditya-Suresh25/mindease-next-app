import express from "express";
import { getUserStats } from "../controllers/user";
import { auth } from "../middleware/auth";

const router = express.Router();

// Get user stats (streak, etc)
router.get("/stats", auth, getUserStats);

export default router;
