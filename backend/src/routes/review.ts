import { Router } from "express";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/adminAuth";
import {
  canSubmitReview,
  submitReview,
  dismissReviewPrompt,
  getTestimonials,
  getReviewsForModeration,
  moderateReview,
  getReviewStats,
  deleteReview,
  getLiveTestimonials,
} from "../controllers/reviewController";

const router = Router();

// Public routes (no auth required)
router.get("/testimonials", getTestimonials);

// Protected user routes (require authentication)
router.get("/can-submit", auth, canSubmitReview);
router.post("/", auth, submitReview);
router.post("/dismiss", auth, dismissReviewPrompt);

// Protected admin routes (require admin authentication)
router.get("/admin", adminAuth, getReviewsForModeration);
router.get("/admin/stats", adminAuth, getReviewStats);
router.get("/admin/live", adminAuth, getLiveTestimonials);
router.patch("/admin/:reviewId", adminAuth, moderateReview);
router.delete("/admin/:reviewId", adminAuth, deleteReview);

export default router;
