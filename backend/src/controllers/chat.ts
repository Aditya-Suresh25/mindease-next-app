import { NextFunction, Request, Response } from "express";
import { ChatSession, IChatSession } from "../models/ChatSession";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import { inngest } from "../inngest/index";
import { User } from "../models/User";
import { InngestSessionResponse, InngestEvent } from "../types/inngest";

import { Types } from "mongoose";
import { updateUserStreak } from "../utils/streak";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getAllSessions = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });
    logger.info(`Retrieved ${sessions.length} sessions for user ${userId} from DB.`);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Create a new chat session
export const createChatSession = async (req: any, res: any) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;

    // Generate a unique sessionId for the new session
    const sessionId = uuidv4();

    const session = new ChatSession({
      sessionId,
      userId,
      startTime: new Date(),
      status: "active",
      messages: [],
    });

    await session.save();
    logger.info(`Session created and saved to DB. ID: ${session.sessionId}, User: ${userId}`);

    res.status(201).json({
      message: "Chat session created successfully",
      sessionId: session.sessionId,
    });
  } catch (error) {
    logger.error("Error creating chat session:", error);
    res.status(500).json({
      message: "Error creating chat session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ...existing code...

export const deleteChatSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await ChatSession.findOne({ sessionId: id });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await ChatSession.deleteOne({ sessionId: id });
    res.json({ message: "Chat session deleted successfully" });
  } catch (error) {
    logger.error("Error deleting chat session:", error);
    res.status(500).json({ message: "Error deleting chat session" });
  }
};


// In-memory map for rate limiting (Debounce)
const sessionLastRequestMap = new Map<string, number>();
const MIN_REQUEST_INTERVAL_MS = 2000; // 2 seconds between messages

// Send a message in the chat session
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    // 1. Debounce Check
    const lastRequest = sessionLastRequestMap.get(sessionId) || 0;
    const now = Date.now();
    if (now - lastRequest < MIN_REQUEST_INTERVAL_MS) {
      const waitTime = Math.ceil((MIN_REQUEST_INTERVAL_MS - (now - lastRequest)) / 1000);
      logger.warn(`Debounce blocked request for session ${sessionId}. Wait: ${waitTime}s`);
      return res.status(429).json({
        message: "Please wait a moment before sending another message.",
        retryAfter: waitTime,
        cooldown: waitTime
      });
    }
    sessionLastRequestMap.set(sessionId, now);

    logger.info("Processing message:", { sessionId, message });

    // Find session by sessionId
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      logger.warn("Session not found:", { sessionId });
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      logger.warn("Unauthorized access attempt:", { sessionId, userId });
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Create Inngest event for message processing
    const event: InngestEvent = {
      name: "therapy/session.message",
      data: {
        message,
        history: session.messages,
        memory: {
          userProfile: { emotionalState: [], riskLevel: 0, preferences: {} },
          sessionContext: { conversationThemes: [], currentTechnique: null },
        },
        goals: [],
        systemPrompt: `You are an AI therapist assistant. Your role is to:
          1. Provide empathetic and supportive responses
          2. Use evidence-based therapeutic techniques
          3. Maintain professional boundaries
          4. Monitor for risk factors
          5. Guide users toward their therapeutic goals`,
      },
    };

    logger.info("Sending message to Inngest:", { event });

    // Send event to Inngest for logging and analytics
    await inngest.send(event);

    // Process the message directly using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Analyze the message
    const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
    Message: ${message}
    Context: ${JSON.stringify({
      memory: event.data.memory,
      goals: event.data.goals,
    })}
    
    IMPORTANT: Set "isCrisis" to true ONLY if the message contains:
    - Suicidal thoughts or ideation
    - Self-harm intentions or mentions
    - Immediate danger to self or others
    - Severe emotional distress indicating urgent help needed
    
    Required JSON structure:
    {
      "emotionalState": "string",
      "themes": ["string"],
      "riskLevel": number (0-5, where 5 is highest risk),
      "isCrisis": boolean,
      "recommendedApproach": "string",
      "progressIndicators": ["string"],
      "suggestedResponses": ["string (max 3 short user reply options - these should be what the USER might say next, written from first-person perspective like 'I want to try that' or 'Can you explain more?' - NOT what the therapist would say)"]
    }`;

    let analysis: any = null;
    try {
      const analysisResult = await model.generateContent(analysisPrompt);
      const analysisText = analysisResult.response.text().trim();
      const cleanAnalysisText = analysisText
        .replace(/```json\n|\n```/g, "")
        .trim();
      analysis = JSON.parse(cleanAnalysisText);

      logger.info("Message analysis:", analysis);
    } catch (aiError: any) {
      logger.error("AI analysis failed:", aiError);
      const msg = aiError?.message || String(aiError); // e.g. "Candidate was blocked due to safety"

      // Fallback analysis if AI fails
      analysis = {
        emotionalState: "neutral",
        themes: [],
        riskLevel: 0,
        isCrisis: false,
        recommendedApproach: "supportive",
        progressIndicators: [],
        suggestedResponses: []
      };

      if (/quota|Too Many Requests|429|exceeded/i.test(msg)) {
        return res.status(429).json({
          message: "AI quota exceeded. Please try again later.",
          error: msg,
          retryAfter: 60, // Default 60s for quota issues
          cooldown: 60
        });
      }
      // Continue execution even if analysis fails (unless it's rate limit), using fallback
    }

    // Generate therapeutic response
    const responsePrompt = `${event.data.systemPrompt}
    
    Based on the following context, generate a therapeutic response:
    Message: ${message}
    Analysis: ${JSON.stringify(analysis)}
    Memory: ${JSON.stringify(event.data.memory)}
    Goals: ${JSON.stringify(event.data.goals)}
    
    Provide a response that:
    1. Addresses the immediate emotional needs
    2. Uses appropriate therapeutic techniques
    3. Shows empathy and understanding
    4. Maintains professional boundaries
    5. Considers safety and well-being`;

    let response: string;
    try {
      const responseResult = await model.generateContent(responsePrompt);
      response = responseResult.response.text().trim();
      logger.info("Generated response:", response);
    } catch (aiError: any) {
      logger.error("AI response generation failed:", aiError);
      const msg = aiError?.message || String(aiError);
      if (/quota|Too Many Requests|429|exceeded/i.test(msg)) {
        return res.status(429).json({
          message: "AI quota exceeded. Please try again later.",
          error: msg,
          retryAfter: 60,
          cooldown: 60
        });
      }
      return res.status(500).json({ message: "AI response generation failed", error: msg });
    }

    logger.info("Generated response:", response);

    // Add message to session history
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    session.messages.push({
      role: "assistant",
      content: response,
      timestamp: new Date(),
      metadata: {
        analysis,
        progress: {
          emotionalState: analysis.emotionalState,
          riskLevel: analysis.riskLevel,
        },
      },
    });

    // Save the updated session
    await session.save();
    logger.info("Session updated successfully:", { sessionId });

    // Return the response with COOLDOWN to pace the user
    res.json({
      response,
      message: response,
      analysis,
      metadata: {
        progress: {
          emotionalState: analysis.emotionalState,
          riskLevel: analysis.riskLevel,
        },
        suggestedResponses: analysis.suggestedResponses || [],
      },
      cooldown: 3, // Standard 3s cooldown after successful message
    });
  } catch (error) {
    logger.error("Error in sendMessage:", error);
    res.status(500).json({
      message: "Error processing message",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get chat session history
export const getSessionHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      messages: session.messages,
      startTime: session.startTime,
      status: session.status,
    });
  } catch (error) {
    logger.error("Error fetching session history:", error);
    res.status(500).json({ message: "Error fetching session history" });
  }
};

export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    logger.info(`Getting chat session: ${sessionId}`);
    const chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      logger.warn(`Chat session not found: ${sessionId}`);
      return res.status(404).json({ error: "Chat session not found" });
    }
    logger.info(`Found chat session: ${sessionId}`);
    res.json(chatSession);
  } catch (error) {
    logger.error("Failed to get chat session:", error);
    res.status(500).json({ error: "Failed to get chat session" });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Find session by sessionId instead of _id
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(session.messages);
  } catch (error) {
    logger.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};