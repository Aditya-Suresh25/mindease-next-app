"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMoodUpdateEvent = exports.sendTherapySessionEvent = void 0;
const index_1 = require("../inngest/index");
const logger_1 = require("./logger");
const sendTherapySessionEvent = async (sessionData) => {
    try {
        await index_1.inngest.send({
            name: "therapy/session.created",
            data: {
                sessionId: sessionData.id,
                userId: sessionData.userId,
                timestamp: new Date().toISOString(),
                requiresFollowUp: sessionData.requiresFollowUp || false,
                sessionType: sessionData.type,
                duration: sessionData.duration,
                notes: sessionData.notes,
                ...sessionData,
            },
        });
        logger_1.logger.info("Therapy session event sent successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to send therapy session event:", error);
        throw error;
    }
};
exports.sendTherapySessionEvent = sendTherapySessionEvent;
// Add more event sending functions as needed
const sendMoodUpdateEvent = async (moodData) => {
    try {
        await index_1.inngest.send({
            name: "mood/updated",
            data: {
                userId: moodData.userId,
                mood: moodData.mood,
                timestamp: new Date().toISOString(),
                context: moodData.context,
                activities: moodData.activities,
                notes: moodData.notes,
                ...moodData,
            },
        });
        logger_1.logger.info("Mood update event sent successfully");
    }
    catch (error) {
        logger_1.logger.error("Failed to send mood update event:", error);
        throw error;
    }
};
exports.sendMoodUpdateEvent = sendMoodUpdateEvent;
