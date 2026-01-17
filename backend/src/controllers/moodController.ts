import { Request, Response, NextFunction } from "express";

import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";
import { sendMoodUpdateEvent } from "../utils/inngestEvents";

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

    // Send update event for AI
    await sendMoodUpdateEvent({
      userId,
      mood: mood,
      context,
      activities
    });

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

    const moods = await Mood.find({ userId, isDeleted: false }).sort({ timestamp: -1 }).limit(50);

    res.status(200).json({ success: true, data: moods });
  } catch (error) {
    next(error);
  }
};

// Update a mood entry
export const updateMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { score, note, context, activities, intensity } = req.body;
    const userId = req.user?._id;

    const mood = await Mood.findOne({ _id: id, userId, isDeleted: false });

    if (!mood) {
      return res.status(404).json({ message: "Mood entry not found" });
    }

    if (score !== undefined) mood.score = score;
    if (note !== undefined) mood.note = note;
    if (intensity !== undefined) mood.intensity = intensity;
    // Context and activities might be part of the schema but not in the interface shown in previous view_file
    // Based on Mood.ts, I see score, intensity, note, aiRecommendations.
    // The createMood uses context and activities, but they are not in the Interface IMood I saw earlier?
    // Let me checking createMood again. It uses context and activities.
    // Wait, let me check Mood.ts again.
    // I saw: score, intensity, note, aiRecommendations.
    // I missed context and activities in Mood.ts view?
    // Let me re-verify Mood.ts content from previous step.
    // Line 27: moodSchema...
    // I see properties: userId, score, intensity, note, aiRecommendations, timestamp.
    // I DO NOT see context or activities in schema!
    // But createMood in moodController.ts lines 24-25 uses context and activities!
    // This implies the previous developer might have added them in a different file or I missed them?
    // Or maybe they are not in schema and mongoose ignores them or strict is false?
    // Wait, createMood passes them to new Mood constructor.
    // If they are not in schema, they won't be saved if strict:true (default).
    // However, I should support updating what's there.
    // In strict mode, fields not in schema are ignored.
    // I will stick to what I see in Schema: score, intensity, note.

    mood.updatedAt = new Date();
    await mood.save();

    // Send update event for AI
    await sendMoodUpdateEvent({
      userId,
      mood: mood,
      context,
      activities
    });

    res.json({ success: true, data: mood });
  } catch (error) {
    next(error);
  }
};

// Soft delete a mood entry
export const deleteMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const mood = await Mood.findOne({ _id: id, userId, isDeleted: false });

    if (!mood) {
      return res.status(404).json({ message: "Mood entry not found" });
    }

    mood.isDeleted = true;
    await mood.save();

    res.json({ success: true, message: "Mood entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};
