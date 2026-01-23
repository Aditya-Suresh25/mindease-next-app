"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";

export const RainPainter = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initCanvas = () => {
            if (canvasRef.current && containerRef.current) {
                const canvas = canvasRef.current;
                const container = containerRef.current;
                
                // Use actual pixel ratio for crisp rendering on mobile Retina displays
                const dpr = window.devicePixelRatio || 1;
                canvas.width = container.offsetWidth * dpr;
                canvas.height = container.offsetHeight * dpr;
                canvas.style.width = `${container.offsetWidth}px`;
                canvas.style.height = `${container.offsetHeight}px`;

                const context = canvas.getContext("2d");
                if (context) {
                    context.scale(dpr, dpr);
                    context.lineCap = "round";
                    context.lineJoin = "round";
                    // Larger brush (50-60) for a natural finger-wipe feel
                    context.lineWidth = 55; 
                    
                    context.globalCompositeOperation = "source-over";
                    context.fillStyle = "rgba(180, 195, 210, 0.92)"; // Dense Cold Fog
                    context.fillRect(0, 0, container.offsetWidth, container.offsetHeight);
                    
                    context.globalCompositeOperation = "destination-out";
                    setCtx(context);
                    setIsLoaded(true);
                }
            }
        };

        initCanvas();
        window.addEventListener("resize", initCanvas);
        return () => window.removeEventListener("resize", initCanvas);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (ctx) ctx.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx || !canvasRef.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const resetCanvas = () => {
        if (containerRef.current && ctx) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "rgba(180, 195, 210, 0.92)";
            ctx.fillRect(0, 0, offsetWidth, offsetHeight);
            ctx.globalCompositeOperation = "destination-out";
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-slate-950 sm:rounded-[3rem] overflow-hidden shadow-2xl group"
        >
            {/* 1. Background View (Outside) */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: isLoaded ? 1 : 1.1 }}
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] ease-linear"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80')",
                    filter: "blur(3px) brightness(0.7)" 
                }}
            />

            {/* 2. Visual Rain Texture Overlay */}
            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            {/* 3. Fog Canvas */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="absolute inset-0 z-20 cursor-crosshair touch-none"
            />

            {/* Action Button - Large for Mobile Thumb */}
            <div className="absolute bottom-10 right-6 z-30">
                <Button
                    variant="secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        resetCanvas();
                    }}
                    className="h-16 w-16 sm:w-auto sm:px-6 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all active:scale-90"
                >
                    <Wind className="sm:mr-2 h-6 w-6" /> 
                    <span className="hidden sm:inline font-black uppercase tracking-wider text-xs">Re-Fog</span>
                </Button>
            </div>

            {/* Hint for first-time users */}
            <AnimatePresence>
                {!isDrawing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[25] flex items-center justify-center pointer-events-none"
                    >
                        <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ x: [-20, 20, -20] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-8 h-8 rounded-full border-2 border-white/20"
                            />
                            Swipe to clear
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};