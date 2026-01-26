"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Spark {
    id: number;
    x: number;
    y: number;
    size: number;
}

const AFFIRMATIONS = [
    "You are doing enough.",
    "Small steps still move you forward.",
    "Your peace is a priority.",
    "It is okay to rest.",
    "You are stronger than you know.",
    "Breathe. You are here.",
];

export const DailySpark = () => {
    const [sparks, setSparks] = useState<Spark[]>([]);
    const [collectedCount, setCollectedCount] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [affirmation, setAffirmation] = useState("");
    const TARGET_SPARKS = 10;

    useEffect(() => {
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

        const interval = setInterval(() => {
            if (completed) return;
            if (sparks.length < 5) {
                const newSpark = {
                    id: Date.now(),
                    // Narrower horizontal range for easier thumb reach
                    x: Math.random() * 70 + 15, 
                    // Centered vertical range to avoid system gestures
                    y: Math.random() * 50 + 25, 
                    // Significantly larger touch targets for mobile (min 44px)
                    size: Math.random() * 10 + 44, 
                };
                setSparks((prev) => [...prev, newSpark]);
            }
        }, 800);

        return () => clearInterval(interval);
    }, [sparks.length, completed]);

    const collectSpark = (id: number) => {
        setSparks((prev) => prev.filter((s) => s.id !== id));
        setCollectedCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= TARGET_SPARKS) {
                setCompleted(true);
            }
            return newCount;
        });
    };

    const handleRestart = () => {
        setCollectedCount(0);
        setCompleted(false);
        setSparks([]);
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
    }

    return (
        <div className="relative w-full h-full min-h-[400px] bg-gradient-to-b from-amber-50 to-orange-100 sm:rounded-3xl overflow-hidden flex flex-col items-center justify-center">
            
            {/* --- COMPACT MOBILE HEADER --- */}
            <div className="absolute top-12 sm:top-8 left-0 w-full text-center z-10 px-6 space-y-1">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="text-amber-900 font-black uppercase tracking-widest text-xs">Daily Spark</h3>
                </motion.div>
                <p className="text-amber-800/60 text-[10px] font-bold uppercase tracking-tighter">
                    Catch {TARGET_SPARKS - collectedCount} more to brighten your day
                </p>
            </div>

            {/* --- PLAY AREA --- */}
            <AnimatePresence>
                {!completed && sparks.map((spark) => (
                    <motion.button
                        key={spark.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
                        whileTap={{ scale: 0.8 }}
                        className="absolute text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer z-20 flex items-center justify-center touch-manipulation"
                        style={{ 
                            left: `${spark.x}%`, 
                            top: `${spark.y}%`,
                            width: spark.size,
                            height: spark.size 
                        }}
                        onClick={() => collectSpark(spark.id)}
                    >
                        <Sparkles 
                            size={spark.size * 0.8} 
                            fill="currentColor" 
                            className="animate-pulse"
                        />
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* --- COMPLETION CARD (Mobile Optimized) --- */}
            <AnimatePresence>
                {completed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="z-30 text-center p-8 sm:p-12 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border-4 border-white mx-6 max-w-sm space-y-6"
                    >
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Trophy className="w-10 h-10 text-amber-500" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-amber-900 tracking-tight">Well Done</h4>
                            <p className="text-amber-800 text-sm sm:text-base font-medium italic leading-relaxed">
                                "{affirmation}"
                            </p>
                        </div>
                        <Button 
                            onClick={handleRestart} 
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-6 h-auto text-lg font-bold shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
                        >
                            <RefreshCcw className="mr-2 h-5 w-5" /> Play Again
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- BOTTOM PROGRESS BAR --- */}
            <div className="absolute bottom-0 left-0 h-4 bg-amber-200/50 w-full backdrop-blur-md border-t border-white/20">
                <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    animate={{ width: `${(collectedCount / TARGET_SPARKS) * 100}%` }}
                    transition={{ type: "spring", stiffness: 50 }}
                />
            </div>
        </div>
    );
};