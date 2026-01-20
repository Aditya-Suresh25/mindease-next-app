"use client";

import { motion } from "framer-motion";
import { MessageSquareHeart, Sparkles, Brain, Sunrise, Shield, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function EcosystemSection() {
    const steps = [
        {
            icon: MessageSquareHeart,
            title: "Thoughtful Support",
            description: "As you chat, MindEase adapts to your tone, offering a safe space to unload and feel heard.",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        },
        {
            icon: Shield,
            title: "Safety Net",
            description: "Our intelligent crisis detection works in the background. If you're in distress, we instantly provide emergency contacts and SOS resources.",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        },
        {
            icon: Sparkles,
            title: "Gentle Suggestions",
            description: "Based on how you feel, discover mood-aware activities—from calming breathing exercises to uplifting games.",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
        },
        {
            icon: BookOpen,
            title: "Knowledge Library",
            description: "Access a curated collection of articles and psycho-education resources to help you understand your mind better.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            icon: Brain,
            title: "Meaningful Reflections",
            description: "Over time, your check-ins turn into deep insights, highlighting patterns and growth you might have missed.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            icon: Sunrise,
            title: "Daily Inspiration",
            description: "Start every day with AI-curated quotes and insights designed specifically for your current journey.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Connecting Line (Background) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">A Continuous Cycle of Care</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        MindEase isn&apos;t just a set of tools—it&apos;s a flowing experience that moves with you through every emotion.
                    </p>
                </motion.div>

                <div className="space-y-12 md:space-y-0 relative">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "flex flex-col md:flex-row items-center gap-8 relative",
                                index % 2 === 0 ? "md:flex-row-reverse" : ""
                            )}
                        >
                            {/* Content Card */}
                            <div className="flex-1 w-full">
                                <div className={cn(
                                    "p-8 rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                                    "bg-card/50 hover:bg-card/80",
                                    step.border
                                )}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={cn("p-3 rounded-xl", step.bg)}>
                                            <step.icon className={cn("w-6 h-6", step.color)} />
                                        </div>
                                        <h3 className="text-xl font-semibold">{step.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Center Node (Desktop) */}
                            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-12 relative">
                                <div className={cn(
                                    "w-4 h-4 rounded-full border-2 bg-background z-10",
                                    step.border.replace("border-", "border-").replace("/20", "") // Solid color
                                )} />
                            </div>

                            {/* Empty Space for layout balance */}
                            <div className="flex-1 hidden md:block" />

                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
