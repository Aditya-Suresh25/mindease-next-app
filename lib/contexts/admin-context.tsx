"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminSession, adminLogout } from "@/lib/api/admin";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin";
}

interface AdminContextType {
  admin: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  checkSession: () => Promise<boolean>;
  setAdmin: (admin: AdminUser | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

      if (!token) {
        setAdmin(null);
        setLoading(false);
        return false;
      }

      const result = await verifyAdminSession();

      if (!result.success || !result.data?.user) {
        localStorage.removeItem("adminToken");
        setAdmin(null);
        setLoading(false);
        return false;
      }

      setAdmin(result.data.user);
      setLoading(false);
      return true;
    } catch {
      localStorage.removeItem("adminToken");
      setAdmin(null);
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    adminLogout();
    setAdmin(null);
    router.push("/admin/login");
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: !!admin,
        logout,
        checkSession,
        setAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
