import { Request, Response, NextFunction } from "express";

import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";

// Create a new mood entry
export const createMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { score, note, context, activities } = req.body;
    const userId = req.user?._id; // From auth middleware

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const mood = new Mood({
      userId,
      score,
      note,
      context,
      activities,
      timestamp: new Date(),
    });

    await mood.save();
    logger.info(`Mood entry created for user ${userId}`);

    res.status(201).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    next(error);
  }
};

// Get recent mood entries for the authenticated user
export const getMoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const moods = await Mood.find({ userId }).sort({ timestamp: -1 }).limit(50);

    res.status(200).json({ success: true, data: moods });
  } catch (error) {
    next(error);
  }
};
