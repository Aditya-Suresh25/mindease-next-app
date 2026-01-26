"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, Flower2, Leaf, Sparkles, RefreshCw, Heart, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Game Constants & Assets ---
const PLANT_TYPES = [
    { Icon: TreePine, color: "text-emerald-400" },
    { Icon: Flower2, color: "text-rose-400" },
    { Icon: Leaf, color: "text-green-400" },
    { Icon: Sparkles, color: "text-amber-300" },
    { Icon: Heart, color: "text-pink-400" },
];

const PRAISE_WORDS = ["Found!", "Bloom", "Nice", "Super", "Lovely"];
const PRAISE_COLORS = ["text-yellow-300", "text-pink-300", "text-cyan-300", "text-lime-300"];

type Plant = {
    id: number;
    xPct: number;
    yPct: number;
    Icon: any;
    color: string;
};

type Feedback = {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
};

export const LuminaPath = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: -200, y: -200 });
    const [plants, setPlants] = useState<Plant[]>([]);
    const [foundIds, setFoundIds] = useState<number[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const generatePlants = useCallback(() => {
        // Use grid-based placement to spread plants apart
        // Divide area into a 4x3 grid and place one plant per cell with randomness
        const gridCols = 4;
        const gridRows = 3;
        const cellWidth = 80 / gridCols; // Leave margins
        const cellHeight = 70 / gridRows;
        
        const positions: { xPct: number; yPct: number }[] = [];
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                // Add randomness within each cell
                const xPct = 10 + col * cellWidth + Math.random() * (cellWidth * 0.6);
                const yPct = 15 + row * cellHeight + Math.random() * (cellHeight * 0.6);
                positions.push({ xPct, yPct });
            }
        }
        
        // Shuffle and pick 10 plants for longer gameplay
        const shuffled = positions.sort(() => Math.random() - 0.5).slice(0, 10);
        
        const newPlants = shuffled.map((pos, i) => {
            const type = PLANT_TYPES[Math.floor(Math.random() * PLANT_TYPES.length)];
            return {
                id: i,
                xPct: pos.xPct,
                yPct: pos.yPct,
                Icon: type.Icon,
                color: type.color,
            };
        });
        setPlants(newPlants);
    }, []);

    useEffect(() => {
        generatePlants();
    }, [generatePlants]);

    const triggerFeedback = (x: number, y: number) => {
        const id = Date.now();
        const text = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)];
        const color = PRAISE_COLORS[Math.floor(Math.random() * PRAISE_COLORS.length)];
        setFeedbacks(prev => [...prev, { id, x, y, text, color }]);
        setTimeout(() => setFeedbacks(prev => prev.filter(f => f.id !== id)), 800);
    };

  const checkCollisions = (cursorX: number, cursorY: number, rect: DOMRect) => {
  if (foundIds.length === plants.length) return;

  plants.forEach((plant) => {
    const plantX = (plant.xPct / 100) * rect.width;
    const plantY = (plant.yPct / 100) * rect.height;
    const distance = Math.hypot(cursorX - plantX, cursorY - plantY);

    // 70px tolerance for mobile
    if (distance < 70) {
      setFoundIds((prev) => {
        // PREVENT DUPLICATES: Only add if the ID isn't already there
        if (prev.includes(plant.id)) return prev;
        
        // Trigger feedback only when a NEW plant is found
        triggerFeedback(plantX, plantY);
        return [...prev, plant.id];
      });
    }
  });
};

    const handleMove = (clientX: number, clientY: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            setPosition({ x, y });
            checkCollisions(x, y, rect);
        }
    };

    const resetGame = () => {
        setFoundIds([]);
        setFeedbacks([]);
        generatePlants();
    };

    const isComplete = plants.length > 0 && foundIds.length === plants.length;

    return (
        <div className="flex flex-col items-center justify-between h-full min-h-[400px] w-full py-6 px-4 bg-slate-950 sm:bg-transparent">
            
            {/* --- MOBILE HEADER --- */}
            <div className="w-full max-w-md flex justify-between items-center z-50">
                <div className="space-y-1">
                    <h3 className="text-white sm:text-slate-800 text-2xl font-black italic tracking-tighter">Lumina Path</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Restore the garden</span>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex flex-col items-end">
                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Bloomed</span>
                    <span className="text-emerald-400 font-black text-xl leading-none">{foundIds.length} / {plants.length}</span>
                </div>
            </div>

            {/* --- GAME VIEWPORT --- */}
            <div
                ref={containerRef}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                className="relative w-full max-w-lg aspect-[4/5] sm:aspect-square bg-slate-900 overflow-hidden rounded-[2.5rem] cursor-none touch-none shadow-2xl border border-white/5"
            >
                {/* 1. Ground Texture (Hidden by Mask) */}
                <div
                    className="absolute inset-0 z-0 bg-slate-800/50"
                    style={{
                        maskImage: `radial-gradient(circle 80px at ${position.x}px ${position.y}px, black 100%, transparent 100%)`,
                        WebkitMaskImage: `radial-gradient(circle 80px at ${position.x}px ${position.y}px, black 100%, transparent 100%)`,
                    }}
                />

                {/* 2. Hidden/Visible Plants */}
                {plants.map((plant) => {
                    const isFound = foundIds.includes(plant.id);
                    return (
                        <div
                            key={plant.id}
                            className="absolute transition-all duration-700 ease-out"
                            style={{
                                left: `${plant.xPct}%`,
                                top: `${plant.yPct}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: isFound ? 20 : 5, 
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: isFound ? 1 : 0.8,
                                    opacity: isFound ? 1 : 0.4,
                                    filter: isFound ? "drop-shadow(0 0 12px currentColor)" : "none"
                                }}
                                className={plant.color}
                            >
                                <plant.Icon size={isFound ? 40 : 24} strokeWidth={isFound ? 2.5 : 2} />
                            </motion.div>
                        </div>
                    );
                })}

                {/* 3. The Shadow Mask */}
                <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                        background: isComplete 
                            ? 'rgba(0,0,0,0.2)' 
                            : `radial-gradient(circle 120px at ${position.x}px ${position.y}px, transparent 0%, rgba(2, 6, 23, 0.98) 100%)`
                    }}
                />

                {/* 4. The Flashlight Spark */}
                {!isComplete && (
                    <motion.div
                        className="absolute pointer-events-none z-30 w-6 h-6 bg-yellow-100 rounded-full blur-[2px] shadow-[0_0_30px_10px_rgba(253,224,71,0.4)]"
                        animate={{ x: position.x - 12, y: position.y - 12 }}
                        transition={{ type: "tween", ease: "linear", duration: 0 }}
                    >
                        <Sun className="w-full h-full text-yellow-400 opacity-50 animate-spin-slow" />
                    </motion.div>
                )}

                {/* 5. Feedback Pops */}
                <AnimatePresence>
                    {feedbacks.map((fb) => (
                        <motion.div
                            key={fb.id}
                            initial={{ opacity: 0, y: fb.y, x: fb.x, scale: 0.5 }}
                            animate={{ opacity: 1, y: fb.y - 40, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            className={cn("absolute z-40 font-black text-sm drop-shadow-md select-none pointer-events-none", fb.color)}
                            style={{ left: 0, top: 0 }}
                        >
                            {fb.text}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* 6. Mobile Win State Overlay */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white p-8 rounded-[2.5rem] text-center shadow-2xl space-y-6 w-full max-w-xs"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                    <Sparkles className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-slate-900">Garden Restored</h2>
                                    <p className="text-slate-500 text-sm font-medium">You've illuminated all the hidden life.</p>
                                </div>
                                <Button 
                                    onClick={resetGame}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold text-lg transition-all active:scale-95"
                                >
                                    <RefreshCw className="mr-2 h-5 w-5" /> Start Again
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- FOOTER HINT --- */}
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] text-center max-w-[240px]">
                {isComplete ? "The garden is at peace" : "Guide the light with your thumb to find hidden life"}
            </p>
        </div>
    );
};