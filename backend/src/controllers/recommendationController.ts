import { Request, Response, NextFunction } from "express";
import { Recommendation } from "../models/Recommendation";

// Get latest recommendation
export const getLatestRecommendation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?._id;
        const { type } = req.query;
        if (!userId) return res.status(401).json({ message: "Not authenticated" });

        const filter: any = { userId };
        if (type) filter.type = type;

        const recommendation = await Recommendation.findOne(filter)
            .sort({ timestamp: -1 })
            .limit(1);

        res.json({
            success: true,
            data: recommendation,
        });
    } catch (error) {
        next(error);
    }
};
