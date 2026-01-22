"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower2, TreePine, Shrub, Mountain, Wind, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { type: "rock", icon: "🪨", label: "Stone" },
  { type: "flower", icon: "🌸", label: "Bloom" },
  { type: "tree", icon: "🌲", label: "Pine" },
  { type: "bamboo", icon: "🎋", label: "Zen" },
];

export function ZenGarden() {
  const [placedItems, setPlacedItems] = useState<
    Array<{ type: string; icon: string; x: number; y: number; rotate: number; id: number }>
  >([]);
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const lastPlacedPos = useRef({ x: 0, y: 0 });
  const gardenRef = useRef<HTMLDivElement>(null);

  const getCoordinates = (e: any) => {
    const rect = gardenRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const addItemsAtPoint = useCallback((x: number, y: number) => {
    const randomRotate = Math.random() * 40 - 20; 
    const randomOffset = () => Math.random() * 8 - 4;

    setPlacedItems((prev) => [
      ...prev, 
      { 
        ...selectedItem, 
        id: Date.now() + Math.random(),
        x: x + randomOffset(), 
        y: y + randomOffset(), 
        rotate: randomRotate 
      }
    ]);
    lastPlacedPos.current = { x, y };
  }, [selectedItem]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;
    addItemsAtPoint(coords.x, coords.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    const dist = Math.sqrt(
      Math.pow(coords.x - lastPlacedPos.current.x, 2) + 
      Math.pow(coords.y - lastPlacedPos.current.y, 2)
    );
    if (dist > 40) addItemsAtPoint(coords.x, coords.y);
  };

  const handleEnd = () => setIsDrawing(false);

  return (
    <div className="flex flex-col h-[100dvh] sm:h-[600px] w-full bg-[#1b241e] overflow-hidden">
      
      {/* --- CLEAN HEADER (No Actions here to avoid overlap) --- */}
      <div className="px-6 py-6 bg-black/20 backdrop-blur-md shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-emerald-400 font-black text-xl italic tracking-tighter leading-none">Zen Garden</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">Craft Your Sanctuary</p>
          </div>
        </div>
      </div>

      {/* --- GARDEN CANVAS --- */}
      <div
        ref={gardenRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className="relative flex-1 w-full bg-[#2d3a31] cursor-crosshair touch-none select-none overflow-hidden"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, #3a4d3f 1.5px, transparent 0),
            linear-gradient(45deg, #25332a 25%, transparent 25%, transparent 75%, #25332a 75%, #25332a)
          `,
          backgroundSize: '40px 40px, 80px 80px',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />

        <AnimatePresence>
            {placedItems.map((item) => (
            <motion.div
                key={item.id}
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, rotate: item.rotate, y: 0 }}
                style={{
                    position: "absolute",
                    left: item.x - 18,
                    top: item.y - 18,
                }}
                className="text-3xl sm:text-4xl pointer-events-none drop-shadow-2xl"
            >
                {item.icon}
            </motion.div>
            ))}
        </AnimatePresence>
        
        {placedItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-12 pointer-events-none">
            <p className="text-emerald-100/10 font-black uppercase tracking-[0.4em] text-[10px]">
                Swipe to grow your garden
            </p>
          </div>
        )}
      </div>

      {/* --- BOTTOM TOOLBAR (Now includes Clear Space) --- */}
      <div className="px-4 pb-10 pt-6 bg-gradient-to-t from-black/60 to-transparent shrink-0">
          <div className="max-w-md mx-auto flex flex-col gap-4">
            
            {/* Primary Item Selector */}
            <div className="flex justify-between items-center gap-2 bg-white/5 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-white/10 shadow-2xl">
                {items.map((item) => (
                    <button
                        key={item.type}
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                            "flex flex-col items-center gap-1 flex-1 py-3 rounded-[2rem] transition-all duration-300",
                            selectedItem.type === item.type 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105" 
                                : "text-white/30 hover:text-white/50"
                        )}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Clear Space Action (Brought Down to Thumb Zone) */}
            <button 
              onClick={() => setPlacedItems([])}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 text-emerald-400/60 rounded-2xl border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95 group"
            >
              <RotateCcw size={16} className="group-active:rotate-[-180deg] transition-transform duration-500" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Clear Space & Breathe</span>
            </button>
          </div>
      </div>
    </div>
  );
}