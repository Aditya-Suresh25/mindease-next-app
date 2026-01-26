import mongoose, { Document, Schema } from "mongoose";

export interface IAdminLog extends Document {
  adminId: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true }, // e.g., "VIEW_USERS", "UPDATE_ACTIVITY", "LOGIN"
    resource: { type: String, required: true }, // e.g., "users", "activities", "reports"
    resourceId: { type: String }, // Optional specific resource ID
    details: { type: Schema.Types.Mixed }, // Additional action details
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for efficient querying
AdminLogSchema.index({ adminId: 1, timestamp: -1 });
AdminLogSchema.index({ action: 1, timestamp: -1 });

export const AdminLog = mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);
