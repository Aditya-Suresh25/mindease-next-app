import { Request, Response } from "express";
import { Mood } from "../models/Mood";
import { ChatSession } from "../models/ChatSession";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Mood categories based on score ranges
type MoodCategory = "low" | "struggling" | "neutral" | "positive" | "thriving";

interface MoodContext {
    score: number;
    category: MoodCategory;
    intensity: number;
    note?: string;
}

// Fallback quotes organized by mood category
const FALLBACK_QUOTES: Record<MoodCategory, string[]> = {
    low: [
        "Even the smallest step forward is still progress.",
        "It's okay to rest. Healing isn't linear.",
        "You've weathered storms before. This one will pass too.",
        "Being gentle with yourself today is enough.",
        "Your feelings are valid, and so is taking your time.",
        "Sometimes just getting through the day is an achievement.",
        "You don't have to have all the answers right now.",
        "It's okay to not be okay.",
    ],
    struggling: [
        "One breath at a time. You're doing better than you think.",
        "Difficult moments don't define your whole story.",
        "It takes strength to keep going. You have that strength.",
        "Be patient with yourself; growth takes time.",
        "Every small act of self-care matters.",
        "You're allowed to take things slowly today.",
        "The weight you carry doesn't diminish your worth.",
        "Reaching out is a sign of courage, not weakness.",
    ],
    neutral: [
        "Today holds its own quiet possibilities.",
        "There's wisdom in simply being present.",
        "Balance isn't about perfection—it's about awareness.",
        "You're exactly where you need to be right now.",
        "Steady moments are the foundation for brighter ones.",
        "Sometimes the ordinary holds unexpected peace.",
        "Give yourself permission to just be today.",
        "Not every day needs to be extraordinary.",
    ],
    positive: [
        "Your light touches more lives than you realize.",
        "Joy is a gift you deserve to receive fully.",
        "This moment of peace is yours to keep.",
        "Let yourself feel the goodness of today.",
        "Your heart knows how to find its way.",
        "Gratitude opens doors you didn't know existed.",
        "Carry this warmth with you wherever you go.",
        "You've earned this moment of lightness.",
    ],
    thriving: [
        "Your energy creates ripples of positivity around you.",
        "This feeling is a testament to your journey.",
        "Embrace this moment—you've cultivated it well.",
        "Your resilience has brought you to this place.",
        "Let this brightness guide your next steps.",
        "You're proof that better days are possible.",
        "This peace you feel was hard-won and well-deserved.",
        "May this contentment stay with you.",
    ],
};

// Determine mood category from score
function getMoodCategory(score: number): MoodCategory {
    if (score <= 20) return "low";
    if (score <= 40) return "struggling";
    if (score <= 60) return "neutral";
    if (score <= 80) return "positive";
    return "thriving";
}

// Get a random fallback quote for a mood category
function getRandomFallbackQuote(category: MoodCategory): string {
    const quotes = FALLBACK_QUOTES[category];
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
}

// Extract brief theme from recent message (privacy-preserving)
function extractBriefTheme(messages: any[]): string | null {
    if (!messages || messages.length === 0) return null;

    // Get the most recent user message
    const recentUserMessages = messages
        .filter((m: any) => m.role === "user")
        .slice(-2);

    if (recentUserMessages.length === 0) return null;

    // Extract analysis themes if available (already privacy-preserving)
    const lastMessage = recentUserMessages[recentUserMessages.length - 1];
    if (lastMessage.metadata?.analysis?.themes?.length > 0) {
        return lastMessage.metadata.analysis.themes[0];
    }

    return null;
}

// Generate AI-based quote
async function generateAIQuote(
    moodContext: MoodContext,
    theme: string | null
): Promise<string | null> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const moodDescriptor = {
            low: "feeling very low and needing gentle support",
            struggling: "going through a difficult time",
            neutral: "in a balanced but reflective state",
            positive: "feeling good and hopeful",
            thriving: "feeling genuinely content and peaceful",
        }[moodContext.category];

        const themeContext = theme
            ? `The person has been thinking about themes related to: ${theme}.`
            : "";

        const prompt = `Generate a single short, supportive quote or affirmation (1-2 lines maximum) for someone who is ${moodDescriptor}. ${themeContext}

STRICT RULES:
- Output ONLY the quote, nothing else
- No quotation marks around the quote
- No attribution or author
- No advice, commands, or instructions
- No clinical or diagnostic language
- No mention of AI, technology, or personalization
- No motivational hype or toxic positivity
- Keep it calm, human, grounding, and emotionally safe
- If a theme was provided, subtly reflect it without directly referencing it
- Maximum 25 words

The quote should feel like a gentle whisper of support, not a notification or feature.`;

        const result = await model.generateContent(prompt);
        const quote = result.response.text().trim();

        // Validate the response
        if (quote.length > 0 && quote.length < 200 && !quote.includes("AI") && !quote.includes("algorithm")) {
            return quote;
        }

        return null;
    } catch (error) {
        logger.error("AI quote generation failed:", error);
        return null;
    }
}

// Main quote generation endpoint
export const getDailyQuote = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;

        // Fetch latest mood (deterministic)
        const latestMood = await Mood.findOne({ userId })
            .sort({ timestamp: -1 })
            .lean();

        // Build mood context
        let moodContext: MoodContext;

        if (latestMood) {
            moodContext = {
                score: latestMood.score,
                category: getMoodCategory(latestMood.score),
                intensity: latestMood.intensity || 3,
                note: latestMood.note,
            };
        } else {
            // Default to neutral if no mood data
            moodContext = {
                score: 50,
                category: "neutral",
                intensity: 3,
            };
        }

        // Optionally fetch recent context (last session, if updated recently)
        let theme: string | null = null;
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const recentSession = await ChatSession.findOne({
            userId,
            updatedAt: { $gte: oneDayAgo },
        })
            .sort({ updatedAt: -1 })
            .select("messages.role messages.metadata.analysis.themes")
            .lean();

        if (recentSession?.messages) {
            theme = extractBriefTheme(recentSession.messages);
        }

        // Try AI generation first, fallback to templates
        let quote = await generateAIQuote(moodContext, theme);

        if (!quote) {
            quote = getRandomFallbackQuote(moodContext.category);
        }

        // Return quote without exposing internal logic
        res.json({
            quote,
            // Only return category for potential UI styling (not score)
            mood: moodContext.category,
        });
    } catch (error) {
        logger.error("Quote generation error:", error);

        // Always return something supportive
        res.json({
            quote: "You're doing your best, and that's always enough.",
            mood: "neutral",
        });
    }
};

// Get quote without authentication (for landing page)
export const getPublicQuote = async (_req: Request, res: Response) => {
    const generalQuotes = [
        "Every moment is a fresh beginning.",
        "You are worthy of peace and rest.",
        "Small steps lead to meaningful journeys.",
        "Your presence in this world matters.",
        "Take a breath. You're exactly where you need to be.",
        "Kindness to yourself is never wasted.",
        "Today holds possibilities you haven't yet imagined.",
        "Your feelings are valid, always.",
    ];

    const index = Math.floor(Math.random() * generalQuotes.length);

    res.json({
        quote: generalQuotes[index],
        mood: "neutral",
    });
};
