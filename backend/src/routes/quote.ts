import express from "express";
import { getDailyQuote, getPublicQuote } from "../controllers/quoteController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Get personalized quote (requires auth)
router.get("/daily", auth, getDailyQuote);

// Get general quote (no auth required, for landing page)
router.get("/public", getPublicQuote);

export default router;
