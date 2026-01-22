"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  initiateLogout: () => Promise<void>;
  completeLogout: () => Promise<void>;
  checkSession: () => Promise<void>;
  showReviewPrompt: boolean;
  setShowReviewPrompt: (show: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const router = useRouter();

  const generateAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name
    )}`;
  };

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { API_BASE, getAuthHeaders } = await import("@/lib/api/base");

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      const data = await response.json();
      const userData = data.user;

      setUser({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || generateAvatar(userData.name),
      });
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { API_BASE, getAuthHeaders } = await import("@/lib/api/base");
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
      }
    } finally {
      localStorage.removeItem("token");
      // Clear auth cookie
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  // Complete logout without checking for review (called after review prompt)
  const completeLogout = useCallback(async () => {
    setShowReviewPrompt(false);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { API_BASE, getAuthHeaders } = await import("@/lib/api/base");
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
      }
    } finally {
      localStorage.removeItem("token");
      // Clear auth cookie
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      router.push("/");
      router.refresh();
    }
  }, [router]);

  // Initiate logout - checks if we should show review prompt first
  const initiateLogout = useCallback(async () => {
    try {
      const { canSubmitReview } = await import("@/lib/api/review");
      const result = await canSubmitReview();
      
      if (result.success && result.canSubmit) {
        // User is eligible for review prompt
        setShowReviewPrompt(true);
      } else {
        // Skip review prompt and logout directly
        await completeLogout();
      }
    } catch {
      // If check fails, just proceed with logout
      await completeLogout();
    }
  }, [completeLogout]);

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        initiateLogout,
        completeLogout,
        checkSession,
        showReviewPrompt,
        setShowReviewPrompt,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
