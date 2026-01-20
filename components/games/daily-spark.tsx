"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        // Pick random affirmation on mount
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

        // Spawn sparks periodically
        const interval = setInterval(() => {
            if (completed) return;
            if (sparks.length < 5) {
                const newSpark = {
                    id: Date.now(),
                    x: Math.random() * 80 + 10, // 10% to 90%
                    y: Math.random() * 60 + 20, // 20% to 80%
                    size: Math.random() * 20 + 24, // 24-44px
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
        <div className="relative w-full h-[400px] bg-amber-50 rounded-xl overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-4 left-0 w-full text-center z-10 pointer-events-none">
                <h3 className="text-amber-900 font-medium">Daily Spark</h3>
                <p className="text-amber-700/60 text-sm">
                    Collect {TARGET_SPARKS - collectedCount > 0 ? TARGET_SPARKS - collectedCount : 0} more sparks.
                </p>
            </div>

            <AnimatePresence>
                {!completed && sparks.map((spark) => (
                    <motion.button
                        key={spark.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute text-amber-500 drop-shadow-lg cursor-pointer z-20 outline-none focus:outline-none"
                        style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
                        onClick={() => collectSpark(spark.id)}
                        transition={{ duration: 0.5 }}
                    >
                        <Sparkles size={spark.size} fill="currentColor" />
                    </motion.button>
                ))}
            </AnimatePresence>

            {completed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="z-30 text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-amber-100 max-w-sm mx-4"
                >
                    <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-amber-900 mb-2">Spark Collected</h4>
                    <p className="text-amber-700 mb-6 italic">"{affirmation}"</p>
                    <Button onClick={handleRestart} className="bg-amber-500 hover:bg-amber-600 text-white">
                        Collect Again
                    </Button>
                </motion.div>
            )}

            {/* Progress Bar */}
            {!completed && (
                <div className="absolute bottom-0 left-0 h-2 bg-amber-200 w-full">
                    <motion.div
                        className="h-full bg-amber-500"
                        animate={{ width: `${(collectedCount / TARGET_SPARKS) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
};
