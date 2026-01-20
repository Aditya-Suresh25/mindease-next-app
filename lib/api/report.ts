import { API_BASE, getAuthHeaders } from "./base";

export interface ReflectionReport {
    _id: string;
    userId: string;
    startDate: string;
    endDate: string;
    period: "7_days" | "14_days" | "30_days";
    content: {
        moodSummary: string;
        activitySummary: string;
        reflection: string;
        suggestions: string;
    };
    createdAt: string;
}

export const generateReport = async (period: "7_days" | "14_days" | "30_days", isMock: boolean = false) => {
    const response = await fetch(`${API_BASE}/api/reports/generate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ period, isMock }),
    });

    if (!response.ok) throw new Error("Failed to generate report");
    return response.json();
};

export const getReports = async (): Promise<ReflectionReport[]> => {
    const response = await fetch(`${API_BASE}/api/reports`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch reports");
    return response.json();
};

export const getReportById = async (id: string): Promise<ReflectionReport> => {
    const response = await fetch(`${API_BASE}/api/reports/${id}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch report");
    return response.json();
};
