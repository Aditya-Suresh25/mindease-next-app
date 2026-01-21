import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import recommendationRouter from "./routes/recommendation";
import userRouter from "./routes/user";
import reportRouter from "./routes/report";
import quoteRouter from "./routes/quote";
import adminRouter from "./routes/admin";
import reviewRouter from "./routes/review";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/index";
import { functions as inngestFunctions } from "./inngest/functions";
import { seedDefaultAdmin, shouldSeedAdmin } from "./utils/seedAdmin";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, you might want to be stricter
      console.warn(`CORS: Origin ${origin} not in allowed list`);
      callback(null, true); // Allow anyway for now, or change to callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger

// Set up Inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);
// OnaF6EGHhgYY9OPv

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/user", userRouter);
app.use("/api/reports", reportRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reviews", reviewRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Seed default admin (development only)
    if (shouldSeedAdmin()) {
      await seedDefaultAdmin();
    }

    // Then start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();