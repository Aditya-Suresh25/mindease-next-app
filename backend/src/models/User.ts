import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  notifications: {
    email: boolean;
    push: boolean;
    dailyCheckIn: boolean;
  };
  privacySettings: {
    publicProfile: boolean;
    shareDataForResearch: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    language: string;
  };
  stats: {
    streak: number;
    lastActiveDate: Date | null;
    totalActiveDays: number;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dailyCheckIn: { type: Boolean, default: true },
    },
    privacySettings: {
      publicProfile: { type: Boolean, default: false },
      shareDataForResearch: { type: Boolean, default: true },
    },
    preferences: {
      theme: { type: String, default: "system" },
      language: { type: String, default: "en" },
    },
    stats: {
      streak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
      totalActiveDays: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);