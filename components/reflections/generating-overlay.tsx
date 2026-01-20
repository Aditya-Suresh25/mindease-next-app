"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, FileText, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

export function GeneratingOverlay() {
    const [step, setStep] = useState(0);

    const steps = [
        { text: "Aggregating mood history...", icon: Brain },
        { text: "Analyzing emotional patterns...", icon: Sparkles },
        { text: "Drafting your reflection...", icon: FileText },
        { text: "Finalizing report...", icon: CheckCircle2 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500); // Change step every 1.5s (total ~6s, matches timeout)

        return () => clearInterval(interval);
    }, [steps.length]);

    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-8 bg-card/30 backdrop-blur-sm rounded-xl border border-primary/10 min-h-[400px]">
            <div className="relative">
                {/* Pulsing Center */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="w-24 h-24 rounded-full bg-primary/10 blur-xl absolute inset-0"
                />

                {/* Icon Animation */}
                <motion.div
                    key={step}
                    initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative z-10 w-16 h-16 bg-card border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-lg transform"
                >
                    {(() => {
                        const Icon = steps[step].icon;
                        return <Icon className="w-8 h-8 text-primary" />;
                    })()}
                </motion.div>
            </div>

            <div className="space-y-4 text-center max-w-xs">
                <motion.h3
                    key={step + "-text"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-medium text-foreground"
                >
                    {steps[step].text}
                </motion.h3>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>
        </div>
    );
}
