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
  const [showReadyPrompt, setShowReadyPrompt] = useState(false);

  useEffect(() => {
    if (isPaused || isComplete || showReadyPrompt) return;

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
              if (r === 1) setShowReadyPrompt(true);
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
  }, [phase, isPaused, isComplete, showReadyPrompt]); 

  const handleReset = () => {
    setPhase("inhale");
    setProgress(0);
    setRound(1);
    setIsComplete(false);
    setIsPaused(false);
    setShowReadyPrompt(false);
  };

  // Shared wrapper style for consistency - uses full height on mobile, auto on desktop
  const containerStyle = "flex flex-col items-center justify-center h-full min-h-[400px] w-full p-6 bg-background text-foreground transition-colors duration-500";

  if (showReadyPrompt) {
    return (
      <div className={containerStyle}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30">
            <Wind className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Round 1 Complete!</p>
            <h3 className="text-4xl font-black tracking-tight">Ready for Round 2?</h3>
            <p className="text-muted-foreground text-base font-medium leading-relaxed">
              Take a moment to relax, then continue when you're ready.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Button variant="outline" onClick={handleReset} className="rounded-full px-6 py-6 h-auto font-bold">
              <RotateCcw className="mr-2 h-4 w-4" /> Start Over
            </Button>
            <Button onClick={() => setShowReadyPrompt(false)} className="rounded-full px-8 py-6 h-auto font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Play className="mr-2 h-4 w-4 fill-current" /> Continue
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className={containerStyle}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30 mb-6"
        >
          <Check className="w-12 h-12 text-green-500" />
        </motion.div>
        <div className="text-center space-y-4 max-w-md">
            <h3 className="text-4xl font-black tracking-tight">Great job!</h3>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              You've completed {TOTAL_ROUNDS} rounds. Take a moment to notice how much calmer you feel.
            </p>
            <Button onClick={handleReset} className="rounded-full px-10 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 mt-4">
              <RotateCcw className="mr-2 h-5 w-5" /> Start Again
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${containerStyle} relative overflow-hidden`}>
      {/* Main Game Layout */}
      <div className="flex flex-col items-center justify-between w-full max-w-4xl h-full py-4 sm:py-8">
        
        <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">Session Progress</span>
            <div className="text-2xl font-bold">Round {round} <span className="text-muted-foreground/40 font-medium">/</span> {TOTAL_ROUNDS}</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 my-8"
            key={phase} 
          >
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
              {/* Pulsing Breathing Ring */}
              <motion.div
                animate={{
                  scale: phase === "inhale" ? 1.5 : phase === "exhale" ? 1 : 1.2,
                  opacity: phase === "hold" ? 0.6 : 1,
                }}
                transition={{ duration: phase === "hold" ? 2 : 4, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/10 rounded-full border-2 border-primary/20 shadow-[0_0_40px_rgba(var(--primary),0.1)]"
              />
              {/* Inner Ring */}
              <motion.div
                 animate={{
                  scale: phase === "inhale" ? 1.1 : phase === "exhale" ? 0.8 : 1.0,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute inset-10 bg-primary/20 rounded-full flex items-center justify-center"
              >
                  <Wind className="w-12 h-12 text-primary" />
              </motion.div>
            </div>

            <div className="space-y-3">
              <h3 className="text-5xl sm:text-6xl font-black tracking-tighter text-foreground">
                  {phase === "inhale" ? "Inhale" : phase === "hold" ? "Hold" : "Exhale"}
              </h3>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                  {phase === "inhale" ? "Fill your lungs" : phase === "hold" ? "Stay still" : "Release slowly"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
              <Progress value={progress} className="h-3 rounded-full bg-primary/10" />
              <div className="flex justify-between text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <span>Phase Progress</span>
                  <span className="text-primary">{Math.round(progress)}%</span>
              </div>
          </div>

          <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsPaused(!isPaused)}
                className="rounded-full px-12 h-16 border-2 font-bold text-lg transition-all active:scale-95 hover:bg-primary hover:text-primary-foreground shadow-sm"
              >
                {isPaused ? (
                  <> <Play className="mr-2 h-6 w-6 fill-current" /> Resume </>
                ) : (
                  <> <Pause className="mr-2 h-6 w-6 fill-current" /> Pause </>
                )}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}