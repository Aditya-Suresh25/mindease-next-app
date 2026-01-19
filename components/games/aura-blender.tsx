"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

export const AuraBlender = () => {
    const [color1, setColor1] = useState(200); // Hue 0-360
    const [color2, setColor2] = useState(280);
    const [color3, setColor3] = useState(150);
    const [breathingDamp, setBreathingDamp] = useState(1);

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
        <div className="relative min-h-[400px] w-full overflow-hidden rounded-xl border border-slate-100">
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

            {/* Subtle overlay texture or effect */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[20px]" />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium text-slate-800">Aura Blender</h3>
                    <p className="text-sm text-slate-600">Mix colors to find your balance.</p>
                </div>

                <div className="w-full max-w-xs space-y-6 bg-white/40 p-6 rounded-2xl border border-white/50 shadow-sm backdrop-blur-md">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex justify-between">
                            <span>Calm</span>
                            <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${color1}, 70%, 70%)` }} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={color1}
                            onChange={(e) => setColor1(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex justify-between">
                            <span>Energy</span>
                            <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${color2}, 70%, 70%)` }} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={color2}
                            onChange={(e) => setColor2(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex justify-between">
                            <span>Focus</span>
                            <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${color3}, 70%, 70%)` }} />
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={color3}
                            onChange={(e) => setColor3(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500"
                        />
                    </div>
                </div>

                <p className="text-xs text-slate-500 opacity-80">
                    Observe how the colors blend together.
                </p>
            </div>
        </div>
    );
};
