import { inngest } from "./index";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReflectionReport } from "../models/ReflectionReport";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateWellbeingReport = inngest.createFunction(
    { id: "generate-wellbeing-report" },
    { event: "report/generated.requested" },
    async ({ event, step }) => {
        const { userId, period, startDate, endDate, isMock } = event.data;

        // 1. Fetch Data Aggregates
        const data = await step.run("fetch-user-data", async () => {
            // MOCK MODE
            if (isMock) {
                return {
                    moodCount: 15,
                    avgMood: 65,
                    moods: [
                        { score: 40, intensity: 3, time: new Date() },
                        { score: 80, intensity: 4, time: new Date() },
                        { score: 60, intensity: 2, time: new Date() }
                    ],
                    activityCount: 8,
                    topActivities: ["Meditation", "Walking", "Journaling"],
                    chatCount: 3,
                    themes: ["Work Stress", "Sleep improvement", "Gratitude"]
                };
            }

            // Dynamic imports to avoid model init issues if not connected yet
            const { Mood } = await import("../models/Mood");
            const { Activity } = await import("../models/Activity");
            const { ChatSession } = await import("../models/ChatSession");

            const start = new Date(startDate);
            const end = new Date(endDate);

            const [moods, activities, sessions] = await Promise.all([
                Mood.find({ userId, timestamp: { $gte: start, $lte: end } }).lean(),
                Activity.find({ userId, timestamp: { $gte: start, $lte: end } }).lean(),
                ChatSession.find({ userId, updatedAt: { $gte: start, $lte: end } }).select("messages.metadata.analysis").lean()
            ]);

            return {
                moodCount: moods.length,
                avgMood: moods.length ? Math.round(moods.reduce((a: any, b: any) => a + b.score, 0) / moods.length) : 0,
                moods: moods.map((m: any) => ({ score: m.score, intensity: m.intensity, time: m.timestamp })),
                activityCount: activities.length,
                topActivities: activities.map((a: any) => a.name),
                chatCount: sessions.length,
                // Abstract themes from chhats (privacy preserving)
                themes: sessions.flatMap((s: any) => s.messages?.map((m: any) => m.metadata?.analysis?.themes || []).flat()).filter(Boolean).slice(0, 10)
            };
        });

        // 2. Generate AI Content
        const reportContent = await step.run("generate-ai-content", async () => {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
      Generate a non-clinical, reflective wellbeing report for the user based on the following data observed over the last ${period}.
      
      Time Range: ${startDate} to ${endDate}
      
      Observed Data:
      - Moods Logged: ${data.moodCount} (Average Score: ${data.avgMood}/100)
      - Activities Logged: ${data.activityCount} (Types: ${data.topActivities.join(", ")})
      - Therapy Sessions: ${data.chatCount}
      - Recurring Themes: ${Array.from(new Set(data.themes)).join(", ")}

      STRICT GUIDLINES:
      1. Tone: Warm, validating, reflective, non-judgmental.
      2. NO medical diagnosis (e.g. do not say "You have depression").
      3. Focus on *patterns* and *effort*.
      4. Use sections: Mood Summary, Activity Summary, Reflection, Gentle Suggestions.

      Output JSON ONLY:
      {
        "moodSummary": "1-2 sentences summarizing emotional patterns.",
        "activitySummary": "1-2 sentences on what they did.",
        "reflection": "A deeper paragraph (3-4 sentences) acknowledging their journey, peaks/valleys, and effort.",
        "suggestions": "2-3 optional, gentle ideas for the future (non-prescriptive)."
      }
      `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/```json|```/g, "").trim();
            return JSON.parse(text);
        });

        // 3. Store Report
        await step.run("store-report", async () => {
            await ReflectionReport.create({
                userId,
                startDate,
                endDate,
                period,
                content: reportContent
            });
        });

        return { success: true };
    }
);
