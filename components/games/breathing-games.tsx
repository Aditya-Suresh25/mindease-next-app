"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Check, Play, Pause, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const TOTAL_ROUNDS = 5;
const INHALE_EXHALE_SPEED = 2; 
const HOLD_SPEED = 4; 

export function BreathingGame() {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [progress, setProgress] = useState(0);
  const [round, setRound] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete) return;

    const intervalId = setInterval(() => {
      setProgress((prevProgress) => {
        const speed = phase === "hold" ? HOLD_SPEED : INHALE_EXHALE_SPEED;
        let nextProgress = prevProgress + speed;

        if (nextProgress >= 100) {
          setPhase((prevPhase) => {
            if (prevPhase === "inhale") return "hold";
            if (prevPhase === "hold") return "exhale";

            setRound((r) => {
              if (r + 1 > TOTAL_ROUNDS) {
                setIsComplete(true);
                return r;
              }
              return r + 1;
            });

            return "inhale"; 
          });

          return 0;
        }

        return nextProgress;
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [phase, isPaused, isComplete]); 


  const handleReset = () => {
    setPhase("inhale");
    setProgress(0);
    setRound(1);
    setIsComplete(false);
    setIsPaused(false);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] sm:h-[500px] w-full p-6 space-y-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30"
        >
          <Check className="w-12 h-12 text-green-500" />
        </motion.div>
        <div className="text-center space-y-2">
            <h3 className="text-3xl font-black tracking-tight">Great job!</h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-[280px] font-medium leading-relaxed">
              You've completed {TOTAL_ROUNDS} rounds. Take a moment to notice how much calmer you feel.
            </p>
        </div>
        <Button 
            onClick={handleReset} 
            className="rounded-full px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <RotateCcw className="mr-2 h-5 w-5" /> Start Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between h-[100dvh] sm:h-[500px] w-full py-12 px-6 sm:justify-center sm:space-y-12">
      {/* Top Header info for Mobile */}
      <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Session Progress</span>
          <div className="text-lg font-bold">Round {round} of {TOTAL_ROUNDS}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="text-center space-y-8"
          key={phase} 
        >
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
            {/* Pulsing Breathing Ring */}
            <motion.div
              animate={{
                scale: phase === "inhale" ? 1.6 : phase === "exhale" ? 1 : 1.3,
                opacity: phase === "hold" ? 0.8 : 1,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary/10 rounded-full border-2 border-primary/20"
            />
            {/* Inner Ring */}
            <motion.div
               animate={{
                scale: phase === "inhale" ? 1.2 : phase === "exhale" ? 0.9 : 1.1,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute inset-8 bg-primary/20 rounded-full flex items-center justify-center"
            >
                <Wind className="w-10 h-10 text-primary" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <h3 className="text-4xl font-black tracking-tighter text-foreground">
                {phase === "inhale" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale"}
            </h3>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                {phase === "inhale" ? "Fill your lungs" : phase === "hold" ? "Stay still" : "Release slowly"}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-xs space-y-8">
        <div className="space-y-3">
            <Progress value={progress} className="h-3 rounded-full bg-primary/10" />
            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>Phase Progress</span>
                <span>{Math.round(progress)}%</span>
            </div>
        </div>

        <div className="flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsPaused(!isPaused)}
              className="rounded-full px-10 h-14 border-2 font-bold text-base transition-all active:scale-95 hover:bg-primary hover:text-primary-foreground group"
            >
              {isPaused ? (
                <> <Play className="mr-2 h-5 w-5 fill-current" /> Resume </>
              ) : (
                <> <Pause className="mr-2 h-5 w-5 fill-current" /> Pause </>
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}