"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TreePine, Flower2, Leaf } from "lucide-react";

export const LuminaPath = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [revealedCount, setRevealedCount] = useState(0);

    // Hardcoded positions for "plants" to find
    const plants = [
        { id: 1, x: "20%", y: "30%", Icon: TreePine, color: "text-emerald-500" },
        { id: 2, x: "70%", y: "20%", Icon: Flower2, color: "text-rose-400" },
        { id: 3, x: "50%", y: "60%", Icon: Leaf, color: "text-green-400" },
        { id: 4, x: "80%", y: "70%", Icon: TreePine, color: "text-teal-500" },
        { id: 5, x: "15%", y: "80%", Icon: Flower2, color: "text-purple-400" },
        { id: 6, x: "40%", y: "20%", Icon: Leaf, color: "text-lime-500" },
    ];

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            });
        }
    }

    // Check for intersections to "reveal" plants permanently (optional, or just temporary reveal)
    // For this design, let's keep it simple: The flashlight reveals them.
    // "As you move, the tunnel illuminates, revealing gentle growing plants."

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full h-[400px] bg-slate-950 overflow-hidden rounded-xl cursor-none touch-none"
        >
            <div className="absolute top-4 left-0 w-full text-center z-20 pointer-events-none">
                <h3 className="text-white/80 text-lg font-medium">Lumina Path</h3>
                <p className="text-white/50 text-sm">Guide the light to find life in the dark.</p>
            </div>

            {/* The visible world (hidden by mask) */}
            <div
                className="absolute inset-0 z-0 bg-slate-900"
                style={{
                    maskImage: `radial-gradient(circle 100px at ${position.x}px ${position.y}px, black 100%, transparent 100%)`,
                    WebkitMaskImage: `radial-gradient(circle 100px at ${position.x}px ${position.y}px, black 0%, transparent 50%)`, // Gradient for soft edge? 
                    // Better mask: standard radial gradient
                }}
            >
                {/* We actually want the 'flashlight' effect. 
           Standard approach: A dark overlay that has a hole.
        */}
            </div>

            {/* Background Content */}
            {plants.map((plant) => (
                <div
                    key={plant.id}
                    className={`absolute ${plant.color} transition-opacity duration-700`}
                    style={{
                        left: plant.x,
                        top: plant.y,
                        // Simple distance check for logic if we wanted to count them, 
                        // but CSS mask is visual only.
                    }}
                >
                    <plant.Icon size={32} />
                </div>
            ))}

            {/* The Dark Overlay with the "Hole" */}
            <div
                className="absolute inset-0 bg-black pointer-events-none z-10"
                style={{
                    background: `radial-gradient(circle 120px at ${position.x}px ${position.y}px, transparent 0%, rgba(0,0,0,0.95) 100%)`
                }}
            />

            {/* The "Spark" follower */}
            <motion.div
                className="absolute pointer-events-none z-20 w-4 h-4 bg-yellow-200 rounded-full blur-[2px] shadow-[0_0_20px_4px_rgba(253,224,71,0.6)]"
                animate={{ x: position.x - 8, y: position.y - 8 }}
                transition={{ type: "tween", ease: "linear", duration: 0.05 }}
            />

        </div>
    );
};
