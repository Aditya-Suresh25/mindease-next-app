import { Request, Response } from "express";
import { Review, ReviewStatus } from "../models/Review";
import { User } from "../models/User";
import { logAdminAction } from "../middleware/adminAuth";
import { subDays } from "date-fns";

const REVIEW_PROMPT_COOLDOWN_DAYS = 7;

/**
 * Check if user can submit a review (7-day rule)
 * GET /api/reviews/can-submit
 */
export const canSubmitReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lastPromptDate = user.lastReviewPromptDate;
    const cooldownDate = subDays(new Date(), REVIEW_PROMPT_COOLDOWN_DAYS);

    // User can submit if they've never been prompted or if cooldown has passed
    const canSubmit = !lastPromptDate || lastPromptDate < cooldownDate;

    res.json({
      success: true,
      canSubmit,
      lastPromptDate: lastPromptDate?.toISOString() || null,
      cooldownDays: REVIEW_PROMPT_COOLDOWN_DAYS,
    });
  } catch (error) {
    console.error("Check can submit review error:", error);
    res.status(500).json({ message: "Failed to check review eligibility" });
  }
};

/**
 * Submit a new review
 * POST /api/reviews
 */
export const submitReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { text, consentToPublish, rating } = req.body;

    // Validate input
    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Review text is required" });
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 10) {
      return res.status(400).json({ message: "Review must be at least 10 characters" });
    }
    if (trimmedText.length > 500) {
      return res.status(400).json({ message: "Review must be 500 characters or less" });
    }

    if (typeof consentToPublish !== "boolean") {
      return res.status(400).json({ message: "Consent flag is required" });
    }

    // Validate optional rating (1-5)
    if (rating !== undefined && rating !== null) {
      const ratingNum = Number(rating);
      if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
    }

    // Check 7-day cooldown
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const lastPromptDate = user.lastReviewPromptDate;
    const cooldownDate = subDays(new Date(), REVIEW_PROMPT_COOLDOWN_DAYS);

    if (lastPromptDate && lastPromptDate >= cooldownDate) {
      return res.status(429).json({ 
        message: "You can only submit a review once every 7 days",
        nextEligibleDate: new Date(lastPromptDate.getTime() + REVIEW_PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
      });
    }

    // Create the review
    const review = new Review({
      userId,
      text: trimmedText,
      consentToPublish,
      rating: rating !== undefined && rating !== null ? Number(rating) : undefined,
      status: "pending",
    });

    await review.save();

    // Update user's last review prompt date
    await User.findByIdAndUpdate(userId, {
      lastReviewPromptDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Thank you for sharing your experience!",
      review: {
        _id: review._id,
        text: review.text,
        rating: review.rating,
        consentToPublish: review.consentToPublish,
        status: review.status,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
};

/**
 * Dismiss review prompt (update last prompt date without submitting)
 * POST /api/reviews/dismiss
 */
export const dismissReviewPrompt = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Update user's last review prompt date to enforce cooldown
    await User.findByIdAndUpdate(userId, {
      lastReviewPromptDate: new Date(),
    });

    res.json({
      success: true,
      message: "Review prompt dismissed",
    });
  } catch (error) {
    console.error("Dismiss review prompt error:", error);
    res.status(500).json({ message: "Failed to dismiss review prompt" });
  }
};

/**
 * Get approved reviews for landing page (public endpoint)
 * GET /api/reviews/testimonials
 */
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 6, 12);

    // Only get reviews that are both user-consented AND admin-approved
    const reviews = await Review.aggregate([
      {
        $match: {
          consentToPublish: true,
          status: "approved",
        },
      },
      // Randomly sample reviews for variety
      { $sample: { size: limit } },
      // Join with users to get first name only
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      // Project only safe, anonymized fields
      {
        $project: {
          _id: 1,
          text: 1,
          rating: 1,
          // Only include first name or anonymize completely
          authorLabel: {
            $cond: {
              if: { $gt: [{ $strLenCP: "$user.name" }, 0] },
              then: {
                $concat: [
                  { $arrayElemAt: [{ $split: ["$user.name", " "] }, 0] },
                  ", MindEase user",
                ],
              },
              else: "A MindEase user",
            },
          },
        },
      },
    ]);

    // Set cache headers for performance
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");

    res.json({
      success: true,
      testimonials: reviews,
    });
  } catch (error) {
    console.error("Get testimonials error:", error);
    res.status(500).json({ message: "Failed to fetch testimonials" });
  }
};

/**
 * Admin: Get all reviews for moderation
 * GET /api/admin/reviews
 */
export const getReviewsForModeration = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as ReviewStatus | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("moderatedBy", "name email")
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: "VIEW_REVIEWS_FOR_MODERATION",
      resource: "reviews",
      details: { status, page, limit },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get reviews for moderation error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * Admin: Moderate a review (approve/reject)
 * PATCH /api/admin/reviews/:reviewId
 */
export const moderateReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { status, notes } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Valid status (approved/rejected) is required" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const previousStatus = review.status;

    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();
    if (notes) {
      review.moderationNotes = notes.substring(0, 500);
    }

    await review.save();

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: `REVIEW_${status.toUpperCase()}`,
      resource: "reviews",
      resourceId: reviewId,
      details: { 
        previousStatus, 
        newStatus: status,
        hasNotes: !!notes,
      },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      review: {
        _id: review._id,
        status: review.status,
        moderatedAt: review.moderatedAt,
      },
    });
  } catch (error) {
    console.error("Moderate review error:", error);
    res.status(500).json({ message: "Failed to moderate review" });
  }
};

/**
 * Admin: Get review statistics
 * GET /api/admin/reviews/stats
 */
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const [pending, approved, rejected, total, withConsent] = await Promise.all([
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "rejected" }),
      Review.countDocuments(),
      Review.countDocuments({ consentToPublish: true }),
    ]);

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: "VIEW_REVIEW_STATS",
      resource: "reviews",
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        total,
        withConsent,
        publishableCount: await Review.countDocuments({ 
          status: "approved", 
          consentToPublish: true 
        }),
      },
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    res.status(500).json({ message: "Failed to fetch review statistics" });
  }
};

/**
 * Admin: Delete a review permanently
 * DELETE /api/admin/reviews/:reviewId
 */
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const deletedReviewInfo = {
      text: review.text.substring(0, 50) + (review.text.length > 50 ? "..." : ""),
      status: review.status,
      consentToPublish: review.consentToPublish,
    };

    await Review.findByIdAndDelete(reviewId);

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: "DELETE_REVIEW",
      resource: "reviews",
      resourceId: reviewId,
      details: deletedReviewInfo,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

/**
 * Admin: Get live testimonials (approved + consented)
 * GET /api/admin/reviews/live
 */
export const getLiveTestimonials = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {
      status: "approved",
      consentToPublish: true,
    };

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ moderatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("moderatedBy", "name email")
        .lean(),
      Review.countDocuments(filter),
    ]);

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action: "VIEW_LIVE_TESTIMONIALS",
      resource: "reviews",
      details: { page, limit },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get live testimonials error:", error);
    res.status(500).json({ message: "Failed to fetch live testimonials" });
  }
};
