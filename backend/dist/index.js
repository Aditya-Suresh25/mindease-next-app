"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_2 = require("inngest/express");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const mood_1 = __importDefault(require("./routes/mood"));
const activity_1 = __importDefault(require("./routes/activity"));
const recommendation_1 = __importDefault(require("./routes/recommendation"));
const user_1 = __importDefault(require("./routes/user"));
const report_1 = __importDefault(require("./routes/report"));
const quote_1 = __importDefault(require("./routes/quote"));
const admin_1 = __importDefault(require("./routes/admin"));
const db_1 = require("./utils/db");
const index_1 = require("./inngest/index");
const functions_1 = require("./inngest/functions");
const seedAdmin_1 = require("./utils/seedAdmin");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Allowed origins for CORS
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
].filter(Boolean);
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            // In production, you might want to be stricter
            console.warn(`CORS: Origin ${origin} not in allowed list`);
            callback(null, true); // Allow anyway for now, or change to callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}));
app.use(express_1.default.json()); // Parse JSON bodies
app.use((0, morgan_1.default)("dev")); // HTTP request logger
// Set up Inngest endpoint
app.use("/api/inngest", (0, express_2.serve)({ client: index_1.inngest, functions: functions_1.functions }));
// OnaF6EGHhgYY9OPv
// Routes
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
app.use("/auth", auth_1.default);
app.use("/chat", chat_1.default);
app.use("/api/mood", mood_1.default);
app.use("/api/activity", activity_1.default);
app.use("/api/recommendations", recommendation_1.default);
app.use("/api/user", user_1.default);
app.use("/api/reports", report_1.default);
app.use("/api/quote", quote_1.default);
app.use("/api/admin", admin_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await (0, db_1.connectDB)();
        // Seed default admin (development only)
        if ((0, seedAdmin_1.shouldSeedAdmin)()) {
            await (0, seedAdmin_1.seedDefaultAdmin)();
        }
        // Then start the server
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            logger_1.logger.info(`Server is running on port ${PORT}`);
            logger_1.logger.info(`Inngest endpoint available at http://localhost:${PORT}/api/inngest`);
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
