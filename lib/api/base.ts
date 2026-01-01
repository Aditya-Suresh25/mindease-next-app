export const API_BASE =
  typeof window !== "undefined"
    ? (window as any).API_BASE || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
    : process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const getAuthHeaders = (): HeadersInit => {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};
