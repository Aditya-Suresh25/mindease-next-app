import mongoose, { Document, Schema } from "mongoose";

export type StoryCategory = "real-story" | "practical-tip" | "personal-experience";
export type StoryStatus = "draft" | "published" | "archived";

export interface IStory extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: StoryCategory;
  tags: string[];
  readTime: number; // in minutes
  status: StoryStatus;
  isAnonymous: boolean; // If true, show author as @handle or "A MindEase User"
  likes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    authorId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    title: { 
      type: String, 
      required: true,
      minlength: 5,
      maxlength: 150 
    },
    content: { 
      type: String, 
      required: true,
      minlength: 50,
      maxlength: 10000 
    },
    category: { 
      type: String, 
      enum: ["real-story", "practical-tip", "personal-experience"], 
      default: "personal-experience",
      index: true
    },
    tags: [{ 
      type: String,
      lowercase: true,
      trim: true
    }],
    readTime: { 
      type: Number, 
      default: 5,
      min: 1,
      max: 60
    },
    status: { 
      type: String, 
      enum: ["draft", "published", "archived"], 
      default: "draft",
      index: true
    },
    isAnonymous: { 
      type: Boolean, 
      default: true 
    },
    likes: { 
      type: Number, 
      default: 0 
    },
    views: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying
StorySchema.index({ status: 1, category: 1, createdAt: -1 });
StorySchema.index({ authorId: 1, status: 1 });

export const Story = mongoose.model<IStory>("Story", StorySchema);
