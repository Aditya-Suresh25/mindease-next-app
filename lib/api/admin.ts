import { API_BASE } from "./base";

// Admin-specific auth headers (uses separate admin token storage)
const getAdminAuthHeaders = (): HeadersInit => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("adminToken");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Admin Login
export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Login failed" };
    }

    // Store admin token separately
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("adminToken", data.token);
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Admin Logout
export const adminLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken");
  }
};

// Verify Admin Session
export const verifyAdminSession = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/verify`, {
      headers: getAdminAuthHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: "Session invalid" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
      headers: getAdminAuthHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch stats" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Mood Trends
export const getMoodTrends = async (days: number = 30) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/analytics/mood-trends?days=${days}`,
      { headers: getAdminAuthHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch mood trends" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Activity Stats
export const getActivityStats = async (days: number = 30) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/analytics/activity-stats?days=${days}`,
      { headers: getAdminAuthHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch activity stats" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Chat Stats
export const getChatStats = async (days: number = 30) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/analytics/chat-stats?days=${days}`,
      { headers: getAdminAuthHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch chat stats" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Report Stats
export const getReportStats = async (days: number = 30) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/analytics/report-stats?days=${days}`,
      { headers: getAdminAuthHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch report stats" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Users List
export const getUsers = async (page: number = 1, limit: number = 20) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/users?page=${page}&limit=${limit}`,
      { headers: getAdminAuthHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch users" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Activity Blueprints
export const getActivityBlueprints = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/activity-blueprints`, {
      headers: getAdminAuthHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch blueprints" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

// Get Admin Logs
export const getAdminLogs = async (page: number = 1, limit: number = 50) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/logs?page=${page}&limit=${limit}`,
      { headers: getAdminAuthHeaders() }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch logs" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};
