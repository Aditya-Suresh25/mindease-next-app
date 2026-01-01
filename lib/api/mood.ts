interface MoodEntry {
  score: number;
  note?: string;
}

interface MoodStats {
  average: number;
  count: number;
  highest: number;
  lowest: number;
  history: Array<{
    _id: string;
    score: number;
    note?: string;
    timestamp: string;
  }>;
}

interface MoodHistoryParams {
  startDate: string;
  endDate: string;
}



import { API_BASE, getAuthHeaders } from "./base";

export async function trackMood(
  data: MoodEntry
): Promise<{ success: boolean; data: any }> {
  const response = await fetch(`${API_BASE}/api/mood`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to track mood");
  }

  return response.json();
}

export async function getMoodHistory(
  params: MoodHistoryParams
): Promise<{ success: boolean; data: any[] }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) throw new Error("Not authenticated");

  const { API_BASE, getAuthHeaders } = await import("./base");

  const query = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
  }).toString();

  const response = await fetch(
    `${API_BASE}/api/mood?${query}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("Mood history error:", text);
    throw new Error("Failed to fetch mood history");
  }

  return response.json();
}

export async function getMoodStats(
  period: "week" | "month" | "year" = "week"
): Promise<{
  success: boolean;
  data: MoodStats;
}> {
  const response = await fetch(`${API_BASE}/api/mood/stats?period=${period}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch mood statistics");
  }

  return response.json();
}
