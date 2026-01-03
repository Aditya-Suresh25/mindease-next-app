import { Inngest } from "inngest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../utils/logger"; // Ensure this path exists or replace with console
import { inngest } from ".";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to handle chat message processing
export const processChatMessage = inngest.createFunction(
  {
    id: "process-chat-message",
    // FIXED: Corrected the object syntax and brace nesting
    rateLimit: {
      limit: 2,
      period: "1m",
    },
  },
  { event: "therapy/session.message" },
  async ({ event, step }) => {
    try {
      const {
        message,
        history,
        memory = {
          userProfile: {
            emotionalState: [],
            riskLevel: 0,
            preferences: {},
          },
          sessionContext: {
            conversationThemes: [],
            currentTechnique: null,
          },
        },
        goals = [],
        systemPrompt,
      } = event.data;

      logger.info("Processing chat message:", {
        message,
        historyLength: history?.length,
      });

      // Analyze the message using Gemini
      const analysis = await step.run("analyze-message", async () => {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
          Message: ${message}
          Context: ${JSON.stringify({ memory, goals })}
          
          Required JSON structure:
          {
            "emotionalState": "string",
            "themes": ["string"],
            "riskLevel": number,
            "recommendedApproach": "string",
            "progressIndicators": ["string"]
          }`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().trim();

          logger.info("Received analysis from Gemini:", { text });

          // Clean the response text to ensure it's valid JSON
          const cleanText = text.replace(/```json\n|\n```/g, "").trim();
          const parsedAnalysis = JSON.parse(cleanText);

          logger.info("Successfully parsed analysis:", parsedAnalysis);
          return parsedAnalysis;
        } catch (error) {
          logger.error("Error in message analysis:", { error, message });
          // Return a default analysis instead of throwing
          return {
            emotionalState: "neutral",
            themes: [],
            riskLevel: 0,
            recommendedApproach: "supportive",
            progressIndicators: [],
          };
        }
      });

      // Update memory based on analysis
      const updatedMemory = await step.run("update-memory", async () => {
        if (analysis.emotionalState) {
          memory.userProfile.emotionalState.push(analysis.emotionalState);
        }
        if (analysis.themes) {
          memory.sessionContext.conversationThemes.push(...analysis.themes);
        }
        if (analysis.riskLevel) {
          memory.userProfile.riskLevel = analysis.riskLevel;
        }
        return memory;
      });

      // If high risk is detected, trigger an alert
      if (analysis.riskLevel > 4) {
        await step.run("trigger-risk-alert", async () => {
          logger.warn("High risk level detected in chat message", {
            message,
            riskLevel: analysis.riskLevel,
          });
        });
      }

      // Generate therapeutic response
      const response = await step.run("generate-response", async () => {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `${systemPrompt}
          
          Based on the following context, generate a therapeutic response:
          Message: ${message}
          Analysis: ${JSON.stringify(analysis)}
          Memory: ${JSON.stringify(memory)}
          Goals: ${JSON.stringify(goals)}
          
          Provide a response that:
          1. Addresses the immediate emotional needs
          2. Uses appropriate therapeutic techniques
          3. Shows empathy and understanding
          4. Maintains professional boundaries
          5. Considers safety and well-being`;

          const result = await model.generateContent(prompt);
          const responseText = result.response.text().trim();

          logger.info("Generated response:", { responseText });
          return responseText;
        } catch (error) {
          logger.error("Error generating response:", { error, message });
          // Return a default response instead of throwing
          return "I'm here to support you. Could you tell me more about what's on your mind?";
        }
      });

      // Return the response in the expected format
      return {
        response,
        analysis,
        updatedMemory,
      };
    } catch (error) {
      logger.error("Error in chat message processing:", {
        error,
        message: event.data.message,
      });
      // Return a default response instead of throwing
      return {
        response:
          "I'm here to support you. Could you tell me more about what's on your mind?",
        analysis: {
          emotionalState: "neutral",
          themes: [],
          riskLevel: 0,
          recommendedApproach: "supportive",
          progressIndicators: [],
        },
        updatedMemory: event.data.memory,
      };
    }
  }
);

// Function to analyze therapy session content
export const analyzeTherapySession = inngest.createFunction(
  { id: "analyze-therapy-session" },
  { event: "therapy/session.created" },
  async ({ event, step }) => {
    try {
      // Get the session content
      const sessionContent = await step.run("get-session-content", async () => {
        return event.data.notes || event.data.transcript;
      });

      // Analyze the session using Gemini
      const analysis = await step.run("analyze-with-gemini", async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Analyze this therapy session and provide insights:
        Session Content: ${sessionContent}
        
        Please provide:
        1. Key themes and topics discussed
        2. Emotional state analysis
        3. Potential areas of concern
        4. Recommendations for follow-up
        5. Progress indicators
        
        Format the response as a JSON object.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text);
      });

      // Store the analysis
      await step.run("store-analysis", async () => {
        // Here you would typically store the analysis in your database
        logger.info("Session analysis stored successfully");
        return analysis;
      });

      // If there are concerning indicators, trigger an alert
      if (analysis.areasOfConcern?.length > 0) {
        await step.run("trigger-concern-alert", async () => {
          logger.warn("Concerning indicators detected in session analysis", {
            sessionId: event.data.sessionId,
            concerns: analysis.areasOfConcern,
          });
          // Add your alert logic here
        });
      }

      return {
        message: "Session analysis completed",
        analysis,
      };
    } catch (error) {
      logger.error("Error in therapy session analysis:", error);
      throw error;
    }
  }
);

// Function to generate personalized activity recommendations
export const generateActivityRecommendations = inngest.createFunction(
  { id: "generate-activity-recommendations" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    try {
      // Get user's mood history and activity history
      const userContext = await step.run("get-user-context", async () => {
        // Here you would typically fetch user's history from your database
        return {
          recentMoods: event.data.recentMoods,
          completedActivities: event.data.completedActivities,
          preferences: event.data.preferences,
        };
      });

      // Generate recommendations using Gemini
      const recommendations = await step.run(
        "generate-recommendations",
        async () => {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `Based on the following user context, generate personalized activity recommendations:
        User Context: ${JSON.stringify(userContext)}
        
        Please provide:
        1. 3-5 personalized activity recommendations
        2. Reasoning for each recommendation
        3. Expected benefits
        4. Difficulty level
        5. Estimated duration
        
        Format the response as a JSON object.`;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          return JSON.parse(text);
        }
      );

      // Store the recommendations
      await step.run("store-recommendations", async () => {
        // Here you would typically store the recommendations in your database
        logger.info("Activity recommendations stored successfully");
        return recommendations;
      });

      return {
        message: "Activity recommendations generated",
        recommendations,
      };
    } catch (error) {
      logger.error("Error generating activity recommendations:", error);
      throw error;
    }
  }
);

// Function to suggest anxiety relief activities based on mood data
export const suggestActivitiesFromMood = async (
  moodData: {
    moodScore: number; // 0-100
    intensity: number; // 1-5
    notes?: string;
  },
  availableActivities: Array<{
    id: string;
    name: string;
    type: "game" | "grounding" | "relaxation" | "cognitive" | "expression";
    description: string;
    suitableMoodCategories: string[];
    durationMinutes: number;
    energyLevel: "low" | "medium" | "high";
  }>
): Promise<{
  reason: string;
  suggestedActivities: Array<{
    id: string;
    name: string;
    type: string;
    durationMinutes: number;
    why: string;
  }>;
}> => {
  try {
    // Determine mood category from moodScore
    let moodCategory: string;
    if (moodData.moodScore <= 20) {
      moodCategory = "very_low";
    } else if (moodData.moodScore <= 40) {
      moodCategory = "low";
    } else if (moodData.moodScore <= 60) {
      moodCategory = "neutral";
    } else if (moodData.moodScore <= 80) {
      moodCategory = "good";
    } else {
      moodCategory = "great";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a mental wellness assistant designed to suggest anxiety relief activities and games.

Your task:
Based on the user's current mood data, select the most suitable activities from the provided activity list.

Inputs:
1. User mood information:
   - moodScore: ${moodData.moodScore} (0-100)
   - intensity: ${moodData.intensity} (1-5)
   - moodCategory: ${moodCategory}
   ${moodData.notes ? `- notes: ${moodData.notes}` : ""}

2. Available activities:
${JSON.stringify(availableActivities, null, 2)}

Rules for selection:
- If moodCategory is very_low or intensity >= 4:
  - Prioritize grounding and calming activities
  - Avoid stimulating or competitive games
- If moodCategory is low:
  - Suggest gentle cognitive or expressive activities
- If moodCategory is neutral:
  - Suggest light engagement or focus based activities
- If moodCategory is good or great:
  - Suggest maintenance, creative, or positive reinforcement activities
- Select 3 to 5 activities maximum
- Prefer variety in activity types
- Do NOT repeat similar activities
- Do NOT invent new activities
- Do NOT provide medical advice
- Only select activities from the provided list

Output format:
Return ONLY valid JSON in the following structure (no markdown, no emojis, no extra text):

{
  "reason": "Short explanation of why these activities were chosen",
  "suggestedActivities": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "durationMinutes": number,
      "why": "One short sentence explaining relevance to the user's mood"
    }
  ]
}

Tone guidelines:
- Calm
- Supportive
- Non judgmental
- Encouraging but not verbose

Important constraints:
- Do not include markdown
- Do not include emojis
- Do not include extra text outside JSON
- Return ONLY the JSON object`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean the response text to ensure it's valid JSON
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Remove any leading/trailing whitespace or markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    logger.info("Received activity suggestions from Gemini:", { text });

    const parsed = JSON.parse(text);

    // Validate the response structure
    if (!parsed.reason || !Array.isArray(parsed.suggestedActivities)) {
      throw new Error("Invalid response structure from AI");
    }

    // Ensure we have 3-5 activities
    if (parsed.suggestedActivities.length < 3) {
      logger.warn("Received fewer than 3 activities, may need adjustment");
    }
    if (parsed.suggestedActivities.length > 5) {
      parsed.suggestedActivities = parsed.suggestedActivities.slice(0, 5);
    }

    logger.info("Successfully parsed activity suggestions:", parsed);
    return parsed;
  } catch (error) {
    logger.error("Error in activity suggestion:", { error, moodData });
    
    // Return a safe default response
    const defaultActivities = availableActivities
      .filter((activity) => {
        // Default to grounding/relaxation if high intensity
        if (moodData.intensity >= 4) {
          return (
            activity.type === "grounding" ||
            activity.type === "relaxation"
          );
        }
        return true;
      })
      .slice(0, 3)
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        durationMinutes: activity.durationMinutes,
        why: "Selected as a supportive activity for your current mood",
      }));

    return {
      reason: "Selected calming activities to support your current mood",
      suggestedActivities: defaultActivities,
    };
  }
};

// Inngest function wrapper for activity suggestions
export const suggestActivitiesFromMoodEvent = inngest.createFunction(
  { id: "suggest-activities-from-mood" },
  { event: "mood/activity-suggestion.requested" },
  async ({ event, step }) => {
    try {
      const { moodData, availableActivities } = event.data;

      const suggestions = await step.run(
        "generate-activity-suggestions",
        async () => {
          return await suggestActivitiesFromMood(moodData, availableActivities);
        }
      );

      return {
        success: true,
        suggestions,
      };
    } catch (error) {
      logger.error("Error in activity suggestion event:", { error });
      throw error;
    }
  }
);

// Add the functions to the exported array
export const functions = [
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations,
  suggestActivitiesFromMoodEvent,
];