"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const CloudLetter = () => {
    const [text, setText] = useState("");
    const [isReleased, setIsReleased] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleRelease = () => {
        if (!text.trim()) return;
        setIsReleased(true);
        // Optional: clear text after animation effectively "deletes" it
    };

    const handleReset = () => {
        setIsResetting(true);
        setTimeout(() => {
            setText("");
            setIsReleased(false);
            setIsResetting(false);
        }, 500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 relative overflow-hidden bg-sky-50 rounded-xl">
            {/* Background clouds */}
            <motion.div
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 left-10 text-white/40"
            >
                <Cloud size={64} />
            </motion.div>
            <motion.div
                animate={{ x: [0, -80, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-20 right-20 text-white/40"
            >
                <Cloud size={48} />
            </motion.div>

            <AnimatePresence mode="wait">
                {!isReleased ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="z-10 w-full max-w-md bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-sky-100"
                    >
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-medium text-sky-900">Cloud Letter</h3>
                            <p className="text-sm text-sky-700">Write down what's on your mind, then let it drift away.</p>
                        </div>

                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="I am feeling worried about..."
                            className="min-h-[120px] mb-4 bg-white/50 border-sky-200 focus:border-sky-400 resize-none text-sky-900 placeholder:text-sky-300"
                        />

                        <Button
                            onClick={handleRelease}
                            disabled={!text.trim()}
                            className="w-full bg-sky-500 hover:bg-sky-600 text-white gap-2"
                        >
                            <Send size={16} /> Release to the Sky
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="floating-cloud"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{
                            x: 200,
                            y: -300,
                            opacity: 0,
                            scale: 0.5
                        }}
                        transition={{ duration: 8, ease: "easeIn" }}
                        className="absolute z-10 flex flex-col items-center"
                        onAnimationComplete={() => {
                            // Wait a bit before offering reset
                        }}
                    >
                        <div className="relative">
                            <Cloud size={180} className="text-white drop-shadow-md text-sky-100 fill-white" />
                            <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden">
                                <p className="text-[10px] text-sky-300 text-center line-clamp-3 select-none blur-[1px]">
                                    {text}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isReleased && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="absolute inset-0 flex items-center justify-center z-0"
                >
                    <div className="text-center">
                        <p className="text-sky-800 font-medium mb-4">It's drifting away...</p>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="border-sky-200 text-sky-700 hover:bg-sky-50"
                        >
                            <RefreshCw size={16} className="mr-2" /> New Cloud
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
