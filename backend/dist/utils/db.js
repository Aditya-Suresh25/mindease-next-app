"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
require("dotenv/config");
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://adi:GAME2003@mindease-mental-wellnes.gnezapk.mongodb.net/?appName=mindease-mental-wellness-assistant";
//Setting up database connection
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        logger_1.logger.info("Connected to MongoDB Atlas");
    }
    catch (error) {
        logger_1.logger.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
