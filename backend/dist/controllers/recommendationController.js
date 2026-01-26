"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestRecommendation = void 0;
const Recommendation_1 = require("../models/Recommendation");
// Get latest recommendation
const getLatestRecommendation = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { type } = req.query;
        if (!userId)
            return res.status(401).json({ message: "Not authenticated" });
        const filter = { userId };
        if (type)
            filter.type = type;
        const recommendation = await Recommendation_1.Recommendation.findOne(filter)
            .sort({ timestamp: -1 })
            .limit(1);
        res.json({
            success: true,
            data: recommendation,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLatestRecommendation = getLatestRecommendation;
