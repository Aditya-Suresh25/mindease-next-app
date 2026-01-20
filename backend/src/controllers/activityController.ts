import { Request, Response, NextFunction } from "express";
import { Activity, IActivity } from "../models/Activity";
import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";
import { selectActivities } from "../utils/activityLogic";
import { ACTIVITY_BLUEPRINTS } from "../data/blueprints";

// Get all available activity blueprints
export const getAllActivityBlueprints = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      data: ACTIVITY_BLUEPRINTS,
    });
  } catch (error) {
    next(error);
  }
};

// Get activity suggestions based on latest mood
export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch the latest mood entry for the user
    const latestMood = await Mood.findOne({ userId, isDeleted: false })
      .sort({ timestamp: -1 })
      .lean();

    // Default values if no mood found
    const moodScore = latestMood?.score ?? 50;
    const intensity = latestMood?.intensity ?? 3;

    // Fetch recent activity IDs to avoid repetition
    const recentActivities = await Activity.find({ userId, isDeleted: false })
      .sort({ timestamp: -1 })
      .limit(5)
      .select("type")
      .lean();

    const recentActivityIds = recentActivities.map((a) => a.type);

    // Generate recommendations using deterministic logic
    const { recommendations, reason } = selectActivities({
      moodScore,
      intensity,
      recentActivityIds,
    });

    logger.info(`Activity suggestions generated for user ${userId}`);

    res.json({
      success: true,
      data: {
        recommendations,
        reason,
        basedOnMood: latestMood
          ? { score: moodScore, intensity, timestamp: latestMood.timestamp }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Log a new activity
export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, name, description, duration, difficulty, feedback } =
      req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const activity = new Activity({
      userId,
      type,
      name,
      description,
      duration,
      difficulty,
      feedback,
      timestamp: new Date(),
    });

    await activity.save();
    logger.info(`Activity logged for user ${userId}`);

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find({
      userId: req.user.id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
};

// Update an activity
export const updateActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type, name, description, duration } = req.body;
    const userId = req.user?._id;

    const activity = await Activity.findOne({ _id: id, userId, isDeleted: false });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    if (type) activity.type = type;
    if (name) activity.name = name;
    if (description) activity.description = description;
    if (duration) activity.duration = duration;

    await activity.save();

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

// Soft delete an activity
export const deleteActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const activity = await Activity.findOne({ _id: id, userId, isDeleted: false });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    activity.isDeleted = true;
    await activity.save();

    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    next(error);
  }
};