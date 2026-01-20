export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
    analysis?: {
      emotionalState: string;
      themes: string[];
      riskLevel: number;
      recommendedApproach: string;
      progressIndicators: string[];
      isCrisis?: boolean;
      safetyFlags?: string[];
    };
    suggestedResponses?: string[];
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse {
  message: string;
  response?: string;
  cooldown?: number;
  analysis?: {
    emotionalState: string;
    themes: string[];
    riskLevel: number;
    recommendedApproach: string;
    progressIndicators: string[];
    isCrisis?: boolean;
    safetyFlags?: string[];
  };
  metadata?: {
    technique: string;
    goal: string;
    progress: any[];
    suggestedResponses?: string[];
  };
}

import { API_BASE, getAuthHeaders } from "./base";

export const createChatSession = async (): Promise<string> => {
  // ... existing createChatSession
  try {
    console.log("Creating new chat session...");
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);

    if (!token) {
      throw new Error("No authentication token found. Please log in first.");
    }

    const response = await fetch(`${API_BASE}/chat/sessions`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create chat session:", error);
      throw new Error(
        error.message || error.error || "Failed to create chat session"
      );
    }

    const data = await response.json();
    console.log("Chat session created:", data);
    return data.sessionId;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};


export const sendChatMessage = async (
  sessionId: string,
  message: string
): Promise<ApiResponse> => {
  try {
    console.log(`Sending message to session ${sessionId}:`, message);
    const response = await fetch(
      `${API_BASE}/chat/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      }
    );
    if (!response.ok) {
      const status = response.status;
      const error = await response.json().catch(() => ({}));
      console.error("Failed to send message:", status, error);

      // If AI quota/rate-limit, return a friendly fallback response instead of throwing
      if (status === 429 || /quota|too many requests|exceeded/i.test(String(error?.message || ""))) {
        const retryAfter = error?.retryAfter || 60; // Get from backend or default
        const fallback: ApiResponse = {
          message: "AI quota exceeded. Returning fallback response.",
          response:
            "I hear you — that sounds really frustrating. It can help to try a short grounding exercise: take three deep breaths, notice five things you can see, four things you can touch, three things you can hear. If you'd like, we can continue when the service is available.",
          cooldown: retryAfter, // Pass cooldown to UI
          analysis: {
            emotionalState: "distressed",
            themes: ["attention", "concentration"],
            riskLevel: 0,
            recommendedApproach: "grounding-exercise",
            progressIndicators: [],
          },
          metadata: {
            technique: "grounding",
            goal: "stabilize_attention",
            progress: [],
          },
        };

        return fallback;
      }

      // For other errors, throw with status and body
      const err = new Error(error.message || error.error || "Failed to send message");
      (err as any).status = status;
      (err as any).body = error;
      throw err;
    }

    const data = await response.json();
    console.log("Message sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

export const getChatHistory = async (
  sessionId: string
): Promise<ChatMessage[]> => {
  try {
    console.log(`Fetching chat history for session ${sessionId}`);
    const response = await fetch(
      `${API_BASE}/chat/sessions/${sessionId}/history`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch chat history:", error);
      throw new Error(error.error || "Failed to fetch chat history");
    }

    const data = await response.json();
    console.log("Received chat history:", data);

    if (!Array.isArray(data)) {
      console.error("Invalid chat history format:", data);
      throw new Error("Invalid chat history format");
    }

    // Ensure each message has the correct format
    return data.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      metadata: msg.metadata,
    }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
};

export const getAllChatSessions = async (): Promise<ChatSession[]> => {
  try {
    console.log("Fetching all chat sessions...");
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);

    if (!token) {
      throw new Error("No authentication token found. Please log in first.");
    }

    const response = await fetch(`${API_BASE}/chat/sessions`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch chat sessions:", error);
      throw new Error(
        error.message || error.error || "Failed to fetch chat sessions"
      );
    }

    const data = await response.json();
    console.log("Received chat sessions:", data);

    return data.map((session: any) => {
      // Ensure dates are valid
      const createdAt = new Date(session.createdAt || Date.now());
      const updatedAt = new Date(session.updatedAt || Date.now());

      return {
        ...session,
        createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
        updatedAt: isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
        messages: (session.messages || []).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || Date.now()),
        })),
      };
    });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    throw error;
  }
};

export async function deleteChatSessionApi(sessionId: string) {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete chat session");
  }

  return res.json();
}

