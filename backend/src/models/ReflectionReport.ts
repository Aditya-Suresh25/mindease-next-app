import mongoose, { Document, Schema } from "mongoose";

export interface IReflectionReport extends Document {
    userId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    period: "7_days" | "14_days" | "30_days";
    content: {
        moodSummary: string;
        activitySummary: string;
        reflection: string;
        suggestions: string;
    };
    createdAt: Date;
}

const reflectionReportSchema = new Schema<IReflectionReport>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        period: {
            type: String,
            required: true,
            enum: ["7_days", "14_days", "30_days"],
        },
        content: {
            moodSummary: { type: String, required: true },
            activitySummary: { type: String, required: true },
            reflection: { type: String, required: true }, // Main AI text
            suggestions: { type: String, required: true },
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index to find reports for a user within a period quickly
reflectionReportSchema.index({ userId: 1, period: 1, createdAt: -1 });

export const ReflectionReport = mongoose.model<IReflectionReport>(
    "ReflectionReport",
    reflectionReportSchema
);
