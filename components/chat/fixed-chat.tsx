"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minus, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function FixedChat() {
  // ...existing state...
  const router = useRouter();

  const handleClick = async () => {
    try {
      const { API_BASE, getAuthHeaders } = await import("@/lib/api/base");
      const resp = await fetch(`${API_BASE}/chat/sessions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!resp.ok) {
        console.error("Failed to create/get session", await resp.text());
        return;
      }

      const data = await resp.json();
      const sessionId = data.sessionId;
      if (sessionId) {
        router.push(`/therapy/${sessionId}`);
      } else {
        console.error("No sessionId returned", data);
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        onClick={handleClick}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}