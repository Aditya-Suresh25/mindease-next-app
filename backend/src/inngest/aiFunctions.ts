import { Inngest } from "inngest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";
import { inngest } from ".";
import { Recommendation } from "../models/Recommendation";

/* ------------------------------------------------------------------ */
/* GEMINI INITIALIZATION + GLOBAL COOLDOWN GATE                        */
/* ------------------------------------------------------------------ */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

let lastGeminiCallAt = 0;
const GEMINI_MIN_INTERVAL = 30_000; // 30 seconds global cooldown

async function safeGeminiCall<T>(fn: () => Promise<T>): Promise<T> {
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

export const processChatMessage = inngest.createFunction(
  {
    id: "process-chat-message",
    rateLimit: { limit: 1, period: "30s" },
  },
  { event: "therapy/session.message" },
  async ({ event, step }) => {
    const {
      message,
      memory = {},
      systemPrompt,
      userId,
    } = event.data;

    try {
      const recentMoods = await step.run("fetch-recent-moods", async () => {
        if (!userId) return [];
        const { Mood } = await import("../models/Mood");
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
    } catch (error) {
      logger.error("Chat processing failed", error);
      return {
        response:
          "I’m here with you. Let’s take a pause and continue when things feel steadier.",
        analysis: {
          emotionalState: "paused",
          riskLevel: 0,
          isCrisis: false,
        },
        updatedMemory: memory,
      };
    }
  }
);

/* ------------------------------------------------------------------ */
/* ACTIVITY RECOMMENDATIONS – PURE LOGIC (NO GEMINI)                   */
/* ------------------------------------------------------------------ */

export const generateActivityRecommendations = inngest.createFunction(
  { id: "generate-activity-recommendations" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    const { selectActivities } = await import("../utils/activityLogic");
    const { moodScore = 50, intensity = 3, userId } = event.data;

    // TODO: Fetch recent activity IDs if needed for history filtering
    // For now, we pass empty history
    const { recommendations, reason } = selectActivities({
      moodScore,
      intensity,
      recentActivityIds: []
    });

    if (userId) {
      await Recommendation.create({
        userId,
        type: "activity_suggestion",
        content: reason,
        context: { filtered: recommendations },
      });
    }

    return { recommendations, reason };
  }
);

/* ------------------------------------------------------------------ */
/* DAILY INSIGHT – ONCE PER DAY MAX                                    */
/* ------------------------------------------------------------------ */

export const generateDailyInsight = inngest.createFunction(
  { id: "generate-daily-insight" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    const { userId } = event.data;
    if (!userId) return;

    const today = new Date().toISOString().slice(0, 10);

    const existing = await Recommendation.findOne({
      userId,
      type: "daily_insight",
      "context.date": today,
    });

    if (existing) return;

    const recentMoods = await step.run("fetch-moods", async () => {
      const { Mood } = await import("../models/Mood");
      return Mood.find({ userId, isDeleted: false })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();
    });

    try {
      const insight = await step.run("generate-insight", async () => {
        return await safeGeminiCall(async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = `
Provide ONE short, supportive, non-clinical daily reflection (max 2 sentences).

Recent moods:
${JSON.stringify(recentMoods)}
`;
          const res = await model.generateContent(prompt);
          return res.response.text().trim();
        });
      });

      await Recommendation.create({
        userId,
        type: "daily_insight",
        content: insight,
        context: { date: today },
      });
    } catch (e) {
      logger.warn("Daily insight skipped due to cooldown");
    }
  }
);

/* ------------------------------------------------------------------ */
/* EXPORT FUNCTIONS                                                    */
/* ------------------------------------------------------------------ */

export const functions = [
  processChatMessage,
  generateActivityRecommendations,
  generateDailyInsight,
];
