"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDailyQuote, getPublicQuote, MoodCategory } from "@/lib/api/quote";
import { Sparkles, RefreshCw, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyQuoteProps {
    /** Whether the user is authenticated */
    isAuthenticated?: boolean;
    /** Custom class name for the container */
    className?: string;
    /** Variant style */
    variant?: "default" | "minimal" | "card";
}

// Mood-based gradient backgrounds
const moodGradients: Record<MoodCategory, string> = {
    low: "from-slate-100/80 via-blue-50/50 to-slate-100/80 dark:from-slate-900/80 dark:via-blue-950/50 dark:to-slate-900/80",
    struggling: "from-slate-100/80 via-purple-50/50 to-slate-100/80 dark:from-slate-900/80 dark:via-purple-950/50 dark:to-slate-900/80",
    neutral: "from-slate-100/80 via-gray-50/50 to-slate-100/80 dark:from-slate-900/80 dark:via-gray-950/50 dark:to-slate-900/80",
    positive: "from-emerald-50/80 via-teal-50/50 to-emerald-50/80 dark:from-emerald-950/80 dark:via-teal-950/50 dark:to-emerald-950/80",
    thriving: "from-amber-50/80 via-yellow-50/50 to-amber-50/80 dark:from-amber-950/80 dark:via-yellow-950/50 dark:to-amber-950/80",
};

// Mood-based accent colors
const moodAccents: Record<MoodCategory, string> = {
    low: "text-blue-600/70 dark:text-blue-400/70",
    struggling: "text-purple-600/70 dark:text-purple-400/70",
    neutral: "text-slate-600/70 dark:text-slate-400/70",
    positive: "text-emerald-600/70 dark:text-emerald-400/70",
    thriving: "text-amber-600/70 dark:text-amber-400/70",
};

export function DailyQuote({ 
    isAuthenticated = false, 
    className,
    variant = "default" 
}: DailyQuoteProps) {
    const [quote, setQuote] = useState<string | null>(null);
    const [mood, setMood] = useState<MoodCategory>("neutral");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchQuote = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const response = isAuthenticated
                ? await getDailyQuote()
                : await getPublicQuote();

            setQuote(response.quote);
            setMood(response.mood);
        } catch (error) {
            // Fallback quote on error
            setQuote("You're doing your best, and that's always enough.");
            setMood("neutral");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQuote();
    }, [isAuthenticated]);

    const handleRefresh = () => {
        if (!isRefreshing) {
            fetchQuote(true);
        }
    };

    if (variant === "minimal") {
        return (
            <div className={cn("text-center py-4", className)}>
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2 text-muted-foreground"
                        >
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="text-sm">Finding your moment...</span>
                        </motion.div>
                    ) : (
                        <motion.p
                            key={quote}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={cn(
                                "text-lg font-medium italic",
                                moodAccents[mood]
                            )}
                        >
                            "{quote}"
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (variant === "card") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "relative overflow-hidden rounded-2xl border border-border/50 backdrop-blur-sm",
                    "bg-gradient-to-br",
                    moodGradients[mood],
                    className
                )}
            >
                {/* Subtle decorative element */}
                <div className="absolute top-4 right-4 opacity-10">
                    <Quote className="h-16 w-16" />
                </div>

                <div className="relative p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className={cn("h-4 w-4", moodAccents[mood])} />
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    Today's Reflection
                                </span>
                            </div>

                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-16 flex items-center"
                                    >
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                                            <div className="h-2 w-2 rounded-full bg-current animate-pulse delay-75" />
                                            <div className="h-2 w-2 rounded-full bg-current animate-pulse delay-150" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.blockquote
                                        key={quote}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="text-xl md:text-2xl font-serif leading-relaxed text-foreground/90"
                                    >
                                        {quote}
                                    </motion.blockquote>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing || isLoading}
                            className={cn(
                                "p-2 rounded-full transition-all duration-300",
                                "hover:bg-background/50 disabled:opacity-50",
                                "focus:outline-none focus:ring-2 focus:ring-primary/20"
                            )}
                            title="Get another reflection"
                        >
                            <RefreshCw
                                className={cn(
                                    "h-4 w-4 text-muted-foreground",
                                    isRefreshing && "animate-spin"
                                )}
                            />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Default variant
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={cn(
                "relative py-8 px-6 text-center",
                className
            )}
        >
            {/* Background glow */}
            <div className={cn(
                "absolute inset-0 rounded-3xl opacity-50",
                "bg-gradient-to-br",
                moodGradients[mood]
            )} />

            <div className="relative space-y-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center"
                >
                    <div className={cn(
                        "p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50",
                        "shadow-lg shadow-primary/5"
                    )}>
                        <Sparkles className={cn("h-5 w-5", moodAccents[mood])} />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-2"
                        >
                            <div className="h-6 w-48 mx-auto bg-muted/50 rounded-full animate-pulse" />
                            <div className="h-6 w-32 mx-auto bg-muted/30 rounded-full animate-pulse" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={quote}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="space-y-4"
                        >
                            <blockquote className="text-xl md:text-2xl font-serif leading-relaxed text-foreground/90 max-w-2xl mx-auto">
                                "{quote}"
                            </blockquote>

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                                    "text-xs font-medium text-muted-foreground",
                                    "bg-background/60 backdrop-blur-sm border border-border/30",
                                    "hover:bg-background/80 hover:border-border/50",
                                    "transition-all duration-300",
                                    "disabled:opacity-50"
                                )}
                            >
                                <RefreshCw className={cn(
                                    "h-3 w-3",
                                    isRefreshing && "animate-spin"
                                )} />
                                Another thought
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default DailyQuote;
