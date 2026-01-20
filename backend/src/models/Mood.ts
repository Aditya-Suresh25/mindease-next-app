import mongoose, { Schema, Document } from "mongoose";

// Interface for the AI Suggestion sub-document
interface IActivitySuggestion {
  id: string;
  name: string;
  type: string;
  durationMinutes: number;
  why: string;
}

export interface IMood extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;        // 0-100 (Mood Level)
  intensity: number;    // 1-5 (Emotional Volume)
  note?: string;
  // Store the AI results directly in the mood entry
  aiRecommendations?: {
    reason: string;
    suggestedActivities: IActivitySuggestion[];
  };
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const moodSchema = new Schema<IMood>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    intensity: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3, // Default to neutral intensity
    },
    note: {
      type: String,
      trim: true,
    },
    // New field to persist AI feedback
    aiRecommendations: {
      reason: String,
      suggestedActivities: [
        {
          id: String,
          name: String,
          type: String,
          durationMinutes: Number,
          why: String,
        },
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of user's mood history
moodSchema.index({ userId: 1, timestamp: -1 });

const Mood = mongoose.model<IMood>("Mood", moodSchema);

export { Mood };