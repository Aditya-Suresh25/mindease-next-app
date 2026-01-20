import { API_BASE, getAuthHeaders } from "./base";

export type MoodCategory = "low" | "struggling" | "neutral" | "positive" | "thriving";

export interface QuoteResponse {
    quote: string;
    mood: MoodCategory;
}

/**
 * Get a personalized daily quote based on user's mood and context.
 * Requires authentication.
 */
export const getDailyQuote = async (): Promise<QuoteResponse> => {
    const response = await fetch(`${API_BASE}/api/quote/daily`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch daily quote");
    }

    return response.json();
};

/**
 * Get a general supportive quote (no auth required).
 * For landing page or unauthenticated users.
 */
export const getPublicQuote = async (): Promise<QuoteResponse> => {
    const response = await fetch(`${API_BASE}/api/quote/public`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch public quote");
    }

    return response.json();
};
