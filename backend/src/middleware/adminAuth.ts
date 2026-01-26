import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../models/User";
import { AdminLog } from "../models/AdminLog";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      isAdmin?: boolean;
    }
  }
}

/**
 * Middleware to check if user is authenticated and has admin role
 */
export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      // Log unauthorized admin access attempt
      await logAdminAction({
        adminId: user._id,
        adminEmail: user.email,
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        resource: req.path,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      return res.status(403).json({ 
        message: "Access denied. Admin privileges required." 
      });
    }

    req.user = user;
    req.isAdmin = true;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
};

/**
 * Middleware to check if user has a specific role
 */
export const requireRole = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: string };

      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${roles.join(" or ")}` 
        });
      }

      req.user = user;
      req.isAdmin = user.role === "admin";
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
  };
};

/**
 * Log admin actions for audit trail
 */
interface AdminLogParams {
  adminId: any;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const logAdminAction = async (params: AdminLogParams): Promise<void> => {
  try {
    const log = new AdminLog({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
    });

    await log.save();
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw - logging failures shouldn't break the main operation
  }
};

/**
 * Middleware wrapper that automatically logs admin actions
 */
export const withAdminLogging = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to log after successful response
    res.json = (body: any) => {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        logAdminAction({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action,
          resource,
          resourceId: req.params.id,
          details: { method: req.method, path: req.path },
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers["user-agent"],
        });
      }

      return originalJson(body);
    };

    next();
  };
};
