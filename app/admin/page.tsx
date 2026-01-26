"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for admin token and redirect accordingly
    const adminToken = localStorage.getItem("adminToken");
    
    if (adminToken) {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}
