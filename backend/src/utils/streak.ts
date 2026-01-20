import { User } from "../models/User";
import { logger } from "./logger";

/**
 * Updates the user's streak stats based on activity.
 * Should be called whenever a user performs a significant action (Chat, Mood, Activity).
 */
export const updateUserStreak = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        if (!user.stats) {
            user.stats = { streak: 0, lastActiveDate: null, totalActiveDays: 0 };
        }

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Check last active date
        let lastActiveStr = "";
        if (user.stats.lastActiveDate) {
            lastActiveStr = new Date(user.stats.lastActiveDate).toISOString().split("T")[0];
        }

        // 1. If active today, do nothing (already counted)
        if (lastActiveStr === todayStr) {
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        // 2. If active yesterday, increment streak
        if (lastActiveStr === yesterdayStr) {
            user.stats.streak += 1;
        }
        // 3. Otherwise (gap > 1 day or first time), reset to 1
        else {
            user.stats.streak = 1;
        }

        // Update stats
        user.stats.lastActiveDate = today;
        user.stats.totalActiveDays += 1;

        await user.save();
        logger.info(`Updated user ${userId} streak to ${user.stats.streak}`);

    } catch (error) {
        logger.error(`Error updating streak for user ${userId}:`, error);
    }
};
