import mongoose, { Document, Schema } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  rating?: number; // Optional star rating (1-5)
  consentToPublish: boolean;
  isAnonymous: boolean; // When true, display "A MindEase User"; when false, show full name
  status: ReviewStatus;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    text: { 
      type: String, 
      required: true,
      minlength: 10,
      maxlength: 500 
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    consentToPublish: { 
      type: Boolean, 
      required: true,
      default: false 
    },
    isAnonymous: {
      type: Boolean,
      required: true,
      default: true // Default to anonymous for privacy
    },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending",
      index: true
    },
    moderatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    moderatedAt: { 
      type: Date 
    },
    moderationNotes: { 
      type: String,
      maxlength: 500
    },
  },
  { timestamps: true }
);

// Index for efficient querying of approved, consented reviews for landing page
ReviewSchema.index({ status: 1, consentToPublish: 1 });

// Index for finding user's latest review
ReviewSchema.index({ userId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
