import { Request, Response } from "express";
import { User } from "../models/User";
import { Session } from "../models/Session";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    // Respond
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      message: "User registered successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    const session = new Session({
      userId: user._id,
      token,
      expiresAt,
      deviceInfo: req.headers["user-agent"],
    });
    await session.save();

    // Respond with user data and token
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
      await Session.deleteOne({ token });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Google OAuth login/register
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    
    if (!email || !name || !googleId) {
      return res.status(400).json({ message: "Email, name, and googleId are required." });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    
    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user with random password (they'll use Google to login)
      const randomPassword = Math.random().toString(36).slice(-16);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = new User({
        name,
        email,
        password: hashedPassword,
        googleId,
        avatar,
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const session = new Session({
      userId: user._id,
      token,
      expiresAt,
      deviceInfo: req.headers["user-agent"],
    });
    await session.save();

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
      token,
      message: "Google authentication successful",
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const { name, handle, notifications, privacySettings, preferences } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    
    // Handle unique handle/slug validation
    if (handle !== undefined) {
      if (handle === "") {
        // Use $unset to remove the handle field
        await User.updateOne({ _id: userId }, { $unset: { handle: 1 } });
      } else {
        // Check if handle is already taken by another user
        const existingUser = await User.findOne({ handle: handle.toLowerCase(), _id: { $ne: userId } });
        if (existingUser) {
          return res.status(400).json({ message: "This handle is already taken" });
        }
        user.handle = handle.toLowerCase();
      }
    }
    
    if (notifications) user.notifications = { ...user.notifications, ...notifications };
    if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      message: "Profile updated successfully", user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        notifications: user.notifications,
        privacySettings: user.privacySettings,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};