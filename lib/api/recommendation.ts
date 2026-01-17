import { API_BASE, getAuthHeaders } from "./base";

export async function getLatestRecommendation(type?: string): Promise<{
    success: boolean;
    data: any;
}> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return { success: false, data: null };

    const query = type ? `?type=${type}` : "";
    const response = await fetch(`${API_BASE}/api/recommendations/latest${query}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch recommendation");
    }

    return response.json();
}
