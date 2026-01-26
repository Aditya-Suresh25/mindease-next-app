"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteActivity = exports.updateActivity = exports.getActivities = exports.logActivity = exports.getSuggestions = exports.getAllActivityBlueprints = void 0;
const Activity_1 = require("../models/Activity");
const Mood_1 = require("../models/Mood");
const logger_1 = require("../utils/logger");
const activityLogic_1 = require("../utils/activityLogic");
const blueprints_1 = require("../data/blueprints");
// Get all available activity blueprints
const getAllActivityBlueprints = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: blueprints_1.ACTIVITY_BLUEPRINTS,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllActivityBlueprints = getAllActivityBlueprints;
// Get activity suggestions based on latest mood
const getSuggestions = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        // Fetch the latest mood entry for the user
        const latestMood = await Mood_1.Mood.findOne({ userId, isDeleted: false })
            .sort({ timestamp: -1 })
            .lean();
        // Default values if no mood found
        const moodScore = latestMood?.score ?? 50;
        const intensity = latestMood?.intensity ?? 3;
        // Fetch recent activity IDs to avoid repetition
        const recentActivities = await Activity_1.Activity.find({ userId, isDeleted: false })
            .sort({ timestamp: -1 })
            .limit(5)
            .select("type")
            .lean();
        const recentActivityIds = recentActivities.map((a) => a.type);
        // Generate recommendations using deterministic logic
        const { recommendations, reason } = (0, activityLogic_1.selectActivities)({
            moodScore,
            intensity,
            recentActivityIds,
        });
        logger_1.logger.info(`Activity suggestions generated for user ${userId}`);
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSuggestions = getSuggestions;
// Log a new activity
const logActivity = async (req, res, next) => {
    try {
        const { type, name, description, duration, difficulty, feedback } = req.body;
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const activity = new Activity_1.Activity({
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
        logger_1.logger.info(`Activity logged for user ${userId}`);
        res.status(201).json({
            success: true,
            data: activity,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logActivity = logActivity;
const getActivities = async (req, res) => {
    try {
        const activities = await Activity_1.Activity.find({
            userId: req.user.id,
            isDeleted: false,
        }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: activities,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
        });
    }
};
exports.getActivities = getActivities;
// Update an activity
const updateActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { type, name, description, duration } = req.body;
        const userId = req.user?._id;
        const activity = await Activity_1.Activity.findOne({ _id: id, userId, isDeleted: false });
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        if (type)
            activity.type = type;
        if (name)
            activity.name = name;
        if (description)
            activity.description = description;
        if (duration)
            activity.duration = duration;
        await activity.save();
        res.json({ success: true, data: activity });
    }
    catch (error) {
        next(error);
    }
};
exports.updateActivity = updateActivity;
// Soft delete an activity
const deleteActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const activity = await Activity_1.Activity.findOne({ _id: id, userId, isDeleted: false });
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        activity.isDeleted = true;
        await activity.save();
        res.json({ success: true, message: "Activity deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteActivity = deleteActivity;
