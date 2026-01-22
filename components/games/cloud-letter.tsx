"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Sparkles, Wind, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const CloudLetter = () => {
    const [currentText, setCurrentText] = useState("");
    const [thoughts, setThoughts] = useState<string[]>([]);
    const [isReleased, setIsReleased] = useState(false);

    const addThought = () => {
        if (!currentText.trim() || thoughts.length >= 8) return;
        setThoughts([...thoughts, currentText]);
        setCurrentText("");
    };

    const removeThought = (index: number) => {
        setThoughts(thoughts.filter((_, i) => i !== index));
    };

    const handleRelease = () => {
        if (thoughts.length === 0) return;
        setIsReleased(true);
    };

    const reset = () => {
        setThoughts([]);
        setIsReleased(false);
        setCurrentText("");
    };

    return (
        <div className="flex flex-col items-center justify-between h-[100dvh] sm:h-[600px] w-full p-4 sm:p-8 relative overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-indigo-100 sm:rounded-[3rem] shadow-2xl">
            
            {/* Subtle Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <motion.div 
                    animate={{ x: [0, 50, 0], y: [0, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-40 -right-20 w-80 h-80 bg-sky-200 rounded-full blur-3xl"
                />
            </div>

            <AnimatePresence mode="wait">
                {!isReleased ? (
                    <motion.div
                        key="input-stage"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, filter: "blur(20px)", y: -20 }}
                        className="z-10 w-full max-w-lg flex flex-col h-full justify-between sm:justify-center py-8 sm:py-0"
                    >
                        <div className="text-center space-y-3">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            >
                                <Sparkles className="text-amber-400 w-10 h-10 mx-auto" />
                            </motion.div>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Gather Your Thoughts</h3>
                            <p className="text-slate-600 text-sm sm:text-base font-medium">Add up to 8 things you'd like to release.</p>
                        </div>

                        {/* Thought Bubbles Grid */}
                        <div className="flex flex-wrap justify-center gap-2 my-8 min-h-[140px] content-start">
                            <AnimatePresence>
                                {thoughts.map((t, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => removeThought(i)}
                                        className="group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-white shadow-sm text-slate-700 rounded-full text-xs sm:text-sm font-bold transition-all hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                                    >
                                        <span className="truncate max-w-[100px]">{t}</span>
                                        <X size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={currentText}
                                    onChange={(e) => setCurrentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addThought()}
                                    placeholder="What is weighing on you?"
                                    className="h-14 rounded-2xl bg-white/90 border-none text-slate-900 shadow-xl focus-visible:ring-2 focus-visible:ring-sky-400 text-base"
                                />
                                <Button 
                                    onClick={addThought}
                                    disabled={!currentText.trim() || thoughts.length >= 8}
                                    className="h-14 w-14 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shrink-0 transition-transform active:scale-90"
                                >
                                    <Plus size={28} strokeWidth={3} />
                                </Button>
                            </div>

                            <Button
                                onClick={handleRelease}
                                disabled={thoughts.length === 0}
                                className={cn(
                                    "w-full h-16 rounded-2xl text-xl font-black shadow-xl gap-3 transition-all active:scale-95",
                                    thoughts.length > 0 
                                        ? "bg-gradient-to-r from-sky-400 to-blue-500 text-white" 
                                        : "bg-slate-200 text-slate-400"
                                )}
                            >
                                <Wind size={24} strokeWidth={3} /> Release into the Sky
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {thoughts.map((thought, index) => (
                            <RandomDriftingCloud key={index} text={thought} index={index} />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {isReleased && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 8 }}
                    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-sky-400/10 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white/95 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-white/50 text-center max-w-sm w-full space-y-6"
                    >
                        <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto">
                            <Sparkles className="text-sky-400 w-10 h-10 animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-3xl font-black text-slate-800">The sky is clear</h4>
                            <p className="text-slate-500 font-medium">Your thoughts have drifted away, leaving space for peace.</p>
                        </div>
                        <Button
                            onClick={reset}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95"
                        >
                            <RefreshCw className="mr-2" size={20} /> Start Over
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

const RandomDriftingCloud = ({ text, index }: { text: string, index: number }) => {
    const seed = index * 123.456;
    const pseudoRandom = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };
    
    const randomXEnd = (pseudoRandom(1) - 0.5) * 600;
    const randomYEnd = -1000; 
    const randomDuration = 10 + pseudoRandom(5) * 5;
    const randomRotation = (pseudoRandom(6) - 0.5) * 30;
    
    return (
        <motion.div
            initial={{ 
                x: "-50%", 
                y: "80vh",
                opacity: 0, 
                scale: 0.5, 
            }}
            animate={{
                x: [`-50%`, `calc(-50% + ${randomXEnd}px)`],
                y: ["80vh", randomYEnd],
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1.5],
                rotate: [0, randomRotation]
            }}
            transition={{ 
                duration: randomDuration, 
                ease: "linear", 
                delay: index * 0.5
            }}
            className="absolute left-1/2 flex items-center justify-center pointer-events-none w-[280px] sm:w-[350px]"
        >
            <div className="relative w-full drop-shadow-2xl">
                <svg viewBox="0 0 24 24" fill="white" className="w-full h-auto opacity-95">
                    <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.1-3.9-4.4C17.6 6.5 14.2 4 10 4 6.7 4 3.9 5.8 2.5 8.5 1.1 9.4 0 10.9 0 12.5 0 15 2 17 4.5 17h13" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center px-12 pb-4">
                    <p className="text-sky-600 font-black text-center text-sm leading-tight italic break-words line-clamp-2">
                        {text}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};