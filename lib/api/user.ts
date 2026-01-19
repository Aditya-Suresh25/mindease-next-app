import { API_BASE, getAuthHeaders } from "./base";

export interface UserStats {
    streak: number;
    totalActiveDays: number;
    lastActiveDate: string;
}

export const getUserStats = async (): Promise<{ success: boolean; data?: UserStats; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE}/api/user/stats`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch user stats");
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { success: false, error: (error as Error).message };
    }
};
