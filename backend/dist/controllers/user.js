"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserStats = void 0;
const User_1 = require("../models/User");
const mongoose_1 = require("mongoose");
const getUserStats = async (req, res) => {
    try {
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const user = await User_1.User.findById(userId).select("stats");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const stats = user.stats || { streak: 0, lastActiveDate: null, totalActiveDays: 0 };
        // Logic: If last active date was BEFORE yesterday, the current "streak" is effectively 0
        // even if we haven't reset it in the DB yet (lazy reset).
        let displayStreak = stats.streak;
        if (stats.lastActiveDate) {
            const lastActive = new Date(stats.lastActiveDate).toISOString().split("T")[0];
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            if (lastActive !== today && lastActive !== yesterday) {
                displayStreak = 0;
            }
        }
        res.json({
            streak: displayStreak,
            totalActiveDays: stats.totalActiveDays,
            lastActiveDate: stats.lastActiveDate
        });
    }
    catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
};
exports.getUserStats = getUserStats;
