interface ActivityEntry {
  type: string;
  name: string;
  description?: string;
  duration?: number;
}


export async function logActivity(
  data: ActivityEntry
): Promise<{ success: boolean; data: any }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) throw new Error("Not authenticated");

  // Use API_BASE from shared helper so the frontend talks to the correct backend
  const { API_BASE, getAuthHeaders } = await import("./base");

  const response = await fetch(`${API_BASE}/api/activity`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to log activity");
  }

  return response.json();
}

export async function getActivities(): Promise<{
  success: boolean;
  data: any[];
}> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) throw new Error("Not authenticated");

  const { API_BASE, getAuthHeaders } = await import("./base");

  const response = await fetch(`${API_BASE}/api/activity`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch activities");
  }

  return response.json();
}
