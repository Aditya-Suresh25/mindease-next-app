"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

export const RainPainter = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            // Set resolution
            canvas.width = canvas.parentElement?.clientWidth || 600;
            canvas.height = 400;

            const context = canvas.getContext("2d");
            if (context) {
                context.lineCap = "round";
                context.lineJoin = "round";
                context.lineWidth = 15; // Thick lines for "cleaning"
                context.strokeStyle = "rgba(255, 255, 255, 0.4)"; // Clear-ish
                context.globalCompositeOperation = "destination-out"; // Erase functionality

                // Fill properly with "Fog"
                const tempCtx = canvas.getContext("2d")!;
                tempCtx.globalCompositeOperation = "source-over";
                tempCtx.fillStyle = "rgba(200, 210, 220, 0.85)"; // Fog color
                tempCtx.fillRect(0, 0, canvas.width, canvas.height);
                tempCtx.globalCompositeOperation = "destination-out"; // Switch back to erase

                setCtx(context);
            }
        }
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

        // Handle both mouse and touch
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
        if (canvasRef.current && ctx) {
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "rgba(200, 210, 220, 0.85)";
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.globalCompositeOperation = "destination-out";
        }
    };

    return (
        <div className="relative w-full h-[400px] bg-slate-800 rounded-xl overflow-hidden">
            {/* Background Image (The View Outside) */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80')"
                    // A rainy window or city street view
                }}
            />

            {/* Rain Effect Overlay (CSS Animation) */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-slate-900/20" />

            {/* Canvas Layer (The Fog) */}
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

            <div className="absolute top-4 left-4 z-30 bg-white/10 backdrop-blur-md p-2 rounded-lg text-white">
                <h3 className="text-sm font-medium">Rain Painter</h3>
                <p className="text-xs opacity-70">Draw on the window to clear the fog.</p>
            </div>

            <div className="absolute bottom-4 right-4 z-30">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetCanvas}
                    className="bg-white/20 hover:bg-white/30 text-white border-none"
                >
                    <Eraser size={16} className="mr-2" /> Fog Up
                </Button>
            </div>
        </div>
    );
};
