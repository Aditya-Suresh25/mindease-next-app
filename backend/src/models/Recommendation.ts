import mongoose, { Document, Schema } from "mongoose";

export interface IRecommendation extends Document {
    userId: mongoose.Types.ObjectId;
    content: string; // The short suggestion
    type: "daily_insight" | "activity_suggestion" | "wellness_tip";
    context?: any; // Store analysis data used to generate this
    timestamp: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        content: { type: String, required: true },
        type: {
            type: String,
            enum: ["daily_insight", "activity_suggestion", "wellness_tip"],
            default: "daily_insight"
        },
        context: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index for efficient retrieval of latest
RecommendationSchema.index({ userId: 1, timestamp: -1 });

export const Recommendation = mongoose.model<IRecommendation>("Recommendation", RecommendationSchema);
