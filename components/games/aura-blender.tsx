"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

export const AuraBlender = () => {
    const [color1, setColor1] = useState(200); // Hue 0-360
    const [color2, setColor2] = useState(280);
    const [color3, setColor3] = useState(150);

    // Smooth animation for the gradient background
    const backgroundStyle = useMemo(() => {
        return {
            background: `
        radial-gradient(circle at 30% 30%, hsla(${color1}, 70%, 70%, 0.8), transparent 60%),
        radial-gradient(circle at 70% 70%, hsla(${color2}, 70%, 70%, 0.8), transparent 60%),
        radial-gradient(circle at 50% 50%, hsla(${color3}, 70%, 70%, 0.8), transparent 50%),
        white
      `,
        };
    }, [color1, color2, color3]);

    return (
        <div className="relative h-[100dvh] sm:min-h-[500px] w-full overflow-hidden sm:rounded-3xl border-none sm:border border-slate-100 bg-white">
            <motion.div
                className="absolute inset-0 opacity-80"
                style={backgroundStyle}
                animate={{
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Optimized Glass Overlay */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[30px] sm:backdrop-blur-[20px]" />

            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 sm:p-8 space-y-6 sm:space-y-8">
                <div className="text-center space-y-2">
                    <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight"
                    >
                        Aura Blender
                    </motion.h3>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm sm:text-base text-slate-600 font-medium"
                    >
                        Mix colors to find your balance.
                    </motion.p>
                </div>

                {/* Controls Container - Optimized for mobile touch and visibility */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-sm space-y-8 bg-white/40 p-6 sm:p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 backdrop-blur-md"
                >
                    {/* Color 1: Calm */}
                    <div className="space-y-4">
                        <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex justify-between items-center">
                            <span>Calmness</span>
                            <div className="w-5 h-5 rounded-full shadow-inner border border-white" style={{ background: `hsl(${color1}, 70%, 70%)` }} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={color1}
                            onChange={(e) => setColor1(Number(e.target.value))}
                            className="w-full h-3 bg-slate-200/50 rounded-full appearance-none cursor-pointer accent-slate-600"
                        />
                    </div>

                    {/* Color 2: Energy */}
                    <div className="space-y-4">
                        <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex justify-between items-center">
                            <span>Vitality</span>
                            <div className="w-5 h-5 rounded-full shadow-inner border border-white" style={{ background: `hsl(${color2}, 70%, 70%)` }} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={color2}
                            onChange={(e) => setColor2(Number(e.target.value))}
                            className="w-full h-3 bg-slate-200/50 rounded-full appearance-none cursor-pointer accent-slate-600"
                        />
                    </div>

                    {/* Color 3: Focus */}
                    <div className="space-y-4">
                        <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex justify-between items-center">
                            <span>Clarity</span>
                            <div className="w-5 h-5 rounded-full shadow-inner border border-white" style={{ background: `hsl(${color3}, 70%, 70%)` }} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={color3}
                            onChange={(e) => setColor3(Number(e.target.value))}
                            className="w-full h-3 bg-slate-200/50 rounded-full appearance-none cursor-pointer accent-slate-600"
                        />
                    </div>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.4 }}
                    className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest text-center max-w-[200px]"
                >
                    Observe how the colors blend together in your space.
                </motion.p>
            </div>
        </div>
    );
};