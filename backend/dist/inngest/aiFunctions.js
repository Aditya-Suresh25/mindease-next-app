"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.processChatMessage = void 0;
const generative_ai_1 = require("@google/generative-ai");
const logger_1 = require("../utils/logger");
const _1 = require(".");
/* ------------------------------------------------------------------ */
/* GEMINI INITIALIZATION + GLOBAL COOLDOWN GATE                        */
/* ------------------------------------------------------------------ */
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let lastGeminiCallAt = 0;
const GEMINI_MIN_INTERVAL = 30000; // 30 seconds global cooldown
async function safeGeminiCall(fn) {
    const now = Date.now();
    if (now - lastGeminiCallAt < GEMINI_MIN_INTERVAL) {
        throw new Error("Gemini global cooldown active");
    }
    lastGeminiCallAt = now;
    return fn();
}
/* ------------------------------------------------------------------ */
/* PROCESS CHAT MESSAGE – SINGLE GEMINI CALL                           */
/* ------------------------------------------------------------------ */
exports.processChatMessage = _1.inngest.createFunction({
    id: "process-chat-message",
    rateLimit: { limit: 1, period: "30s" },
}, { event: "therapy/session.message" }, async ({ event, step }) => {
    const { message, memory = {}, systemPrompt, userId, } = event.data;
    try {
        const recentMoods = await step.run("fetch-recent-moods", async () => {
            if (!userId)
                return [];
            const { Mood } = await Promise.resolve().then(() => __importStar(require("../models/Mood")));
            return Mood.find({ userId, isDeleted: false })
                .sort({ timestamp: -1 })
                .limit(5)
                .lean();
        });
        const result = await step.run("gemini-chat", async () => {
            return await safeGeminiCall(async () => {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = `
${systemPrompt}

You are a calm, non-clinical mental health assistant.

Analyze the user's message AND respond in ONE pass.

Return ONLY valid JSON:

{
  "analysis": {
    "isRelevant": boolean,
    "emotionalState": "string",
    "themes": ["string"],
    "riskLevel": number,
    "recommendedApproach": "string",
    "isCrisis": boolean,
    "safetyFlags": ["string"]
  },
  "response": "empathetic response text"
}

User message:
${message}

Recent moods:
${JSON.stringify(recentMoods)}

Memory:
${JSON.stringify(memory)}
`;
                const res = await model.generateContent(prompt);
                const text = res.response.text().trim();
                const clean = text.replace(/```json|```/g, "").trim();
                return JSON.parse(clean);
            });
        });
        return {
            response: result.response,
            analysis: result.analysis,
            updatedMemory: memory,
        };
    }
    catch (error) {
        logger_1.logger.error("Chat processing failed", error);
        return {
            response: "I'm here with you. Let's take a pause and continue when things feel steadier.",
            analysis: {
                emotionalState: "paused",
                riskLevel: 0,
                isCrisis: false,
            },
            updatedMemory: memory,
        };
    }
});
/* ------------------------------------------------------------------ */
/* EXPORT FUNCTIONS                                                    */
/* ------------------------------------------------------------------ */
exports.functions = [
    exports.processChatMessage,
];
