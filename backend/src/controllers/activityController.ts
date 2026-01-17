import { Request, Response, NextFunction } from "express";
import { Activity, IActivity } from "../models/Activity";
import { logger } from "../utils/logger";
import { sendActivityCompletionEvent } from "../utils/inngestEvents"

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

    // Send activity completion event to Inngest
    await sendActivityCompletionEvent({
      userId,
      id: activity._id,
      type,
      name,
      duration,
      difficulty,
      feedback,
      timestamp: activity.timestamp,
    });

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